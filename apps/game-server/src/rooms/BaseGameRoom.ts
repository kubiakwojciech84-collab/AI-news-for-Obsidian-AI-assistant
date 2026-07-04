import { Room, Client } from "colyseus";
import * as jwt from "jsonwebtoken";
import { GameRoomState, PlayerState } from "@nova/networking";
import { ClientMessage, ServerMessage, MoveInputPayload, GameScene, SceneNode } from "@nova/shared";
import { PhysicsWorld, CharacterBody, createBodyFromNode } from "@nova/physics";
import { GridNavGraph, Obstacle } from "@nova/ai";
import { backendClient } from "../services/backendClient";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const TICK_RATE_HZ = 30;

export interface JoinOptions {
  userId: string;
  username: string;
  accessToken: string;
  gameId: string;
}

export interface SpawnPoint {
  x: number;
  y: number;
  z: number;
  team: string;
}

export interface CheckpointPoint {
  x: number;
  y: number;
  z: number;
  index: number;
}

/** Flattens the (procedurally-flat) scene tree into a single list, ignoring nested transforms. */
export function flattenNodes(root: SceneNode): SceneNode[] {
  const out: SceneNode[] = [];
  const walk = (node: SceneNode) => {
    out.push(node);
    for (const child of node.children) walk(child);
  };
  walk(root);
  return out;
}

/**
 * Shared multiplayer room logic used by every game type: authentication, physics world setup
 * from the published scene, player character bodies, movement/jump/chat handling, and a fixed
 * simulation tick. Concrete games (Obby, Shooter) extend this and layer in win conditions.
 */
export abstract class BaseGameRoom extends Room<GameRoomState> {
  protected physicsWorld!: PhysicsWorld;
  protected navGraph!: GridNavGraph;
  protected scene!: GameScene;
  protected gameDbId = "";
  protected characterBodies = new Map<string, CharacterBody>();
  protected spawnPoints: SpawnPoint[] = [];
  protected checkpoints: CheckpointPoint[] = [];
  protected staticObstacles: Obstacle[] = [];
  protected lastInputSeq = new Map<string, number>();

  abstract defaultGameSlug(): string;

  async onCreate(options: { gameSlug?: string }): Promise<void> {
    this.setState(new GameRoomState());

    const slug = options.gameSlug ?? this.defaultGameSlug();
    const game = await backendClient.getGameBySlug(slug);
    if (!game) {
      throw new Error(`Cannot start room: game "${slug}" not found on backend`);
    }
    this.gameDbId = game.id;
    this.scene = game.scene;
    this.state.gameId = game.id;
    this.state.phase = "playing";

    this.physicsWorld = new PhysicsWorld({ gravity: this.scene.gravity });
    this.navGraph = new GridNavGraph(120, 1);

    const nodes = flattenNodes(this.scene.root);
    for (const node of nodes) {
      const body = createBodyFromNode(node);
      if (body) this.physicsWorld.addBody(body);

      if (node.physics?.enabled && node.physics.isStatic && node.type === "box") {
        const [sx, , sz] = node.scale;
        const [x, , z] = node.position;
        this.staticObstacles.push({ minX: x - sx / 2, maxX: x + sx / 2, minZ: z - sz / 2, maxZ: z + sz / 2 });
      }
      if (node.type === "spawn") {
        const [x, y, z] = node.position;
        const team = (node.metadata?.team as string) ?? "default";
        this.spawnPoints.push({ x, y, z, team });
      }
      if (node.type === "checkpoint") {
        const [x, y, z] = node.position;
        const index = Number(node.metadata?.index ?? 0);
        this.checkpoints.push({ x, y, z, index });
      }
    }
    this.checkpoints.sort((a, b) => a.index - b.index);
    this.navGraph.markObstacles(this.staticObstacles);
    if (this.spawnPoints.length === 0) this.spawnPoints.push({ x: 0, y: 2, z: 0, team: "default" });

    this.onMessage(ClientMessage.MOVE_INPUT, (client, payload: MoveInputPayload) => this.handleMoveInput(client, payload));
    this.onMessage(ClientMessage.JUMP, (client) => this.handleJump(client));
    this.onMessage(ClientMessage.CHAT, (client, body: string) => this.handleChat(client, body));
    this.onMessage(ClientMessage.RESPAWN, (client) => this.respawnPlayer(client.sessionId));
    this.onMessage(ClientMessage.FIRE, (client, payload) => this.handleFire(client, payload));
    this.onMessage(ClientMessage.INTERACT, (client, payload) => this.handleInteract(client, payload));

    this.setSimulationInterval((deltaMs) => this.tick(deltaMs / 1000), 1000 / TICK_RATE_HZ);

    this.spawnBots();
  }

  async onAuth(_client: Client, options: JoinOptions): Promise<JoinOptions> {
    const payload = jwt.verify(options.accessToken, JWT_SECRET) as { sub: string };
    if (payload.sub !== options.userId) throw new Error("Token subject does not match provided userId");
    return options;
  }

  onJoin(client: Client, options: JoinOptions): void {
    const player = new PlayerState();
    player.userId = options.userId;
    player.username = options.username;
    const spawn = this.pickSpawn();
    player.x = spawn.x;
    player.y = spawn.y;
    player.z = spawn.z;
    this.state.players.set(client.sessionId, player);

    const body = new CharacterBody({ position: [spawn.x, spawn.y, spawn.z] });
    this.physicsWorld.addBody(body.body);
    this.characterBodies.set(client.sessionId, body);

    client.send(ServerMessage.WELCOME, { sessionId: client.sessionId, gameId: this.gameDbId });
  }

  onLeave(client: Client): void {
    const body = this.characterBodies.get(client.sessionId);
    if (body) this.physicsWorld.removeBody(body.body);
    this.characterBodies.delete(client.sessionId);
    this.state.players.delete(client.sessionId);
  }

  protected pickSpawn(team?: string): SpawnPoint {
    const candidates = team ? this.spawnPoints.filter((s) => s.team === team) : this.spawnPoints;
    const pool = candidates.length > 0 ? candidates : this.spawnPoints;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  protected respawnPlayer(sessionId: string, team?: string): void {
    const player = this.state.players.get(sessionId);
    const body = this.characterBodies.get(sessionId);
    if (!player || !body) return;
    const spawn = this.pickSpawn(team);
    body.teleport([spawn.x, spawn.y, spawn.z]);
    player.health = 100;
    player.eliminated = false;
  }

  private handleMoveInput(client: Client, payload: MoveInputPayload): void {
    const lastSeq = this.lastInputSeq.get(client.sessionId) ?? -1;
    if (payload.seq <= lastSeq) return;
    this.lastInputSeq.set(client.sessionId, payload.seq);

    const body = this.characterBodies.get(client.sessionId);
    const player = this.state.players.get(client.sessionId);
    if (!body || !player || player.eliminated) return;
    body.setMoveInput(payload.x, payload.z, payload.yaw);
    player.yaw = payload.yaw;
  }

  private handleJump(client: Client): void {
    this.characterBodies.get(client.sessionId)?.jump();
  }

  private handleChat(client: Client, body: string): void {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;
    this.broadcast(ServerMessage.CHAT, { username: player.username, body: String(body).slice(0, 300) });
  }

  protected handleFire(_client: Client, _payload: unknown): void {
    // Overridden by combat games (ShooterRoom).
  }

  protected handleInteract(_client: Client, _payload: unknown): void {
    // Overridden by games with pickups/objectives.
  }

  protected abstract spawnBots(): void;

  protected tick(dt: number): void {
    for (const body of this.characterBodies.values()) body.beginStep();
    this.physicsWorld.step(dt);

    for (const [sessionId, body] of this.characterBodies) {
      const player = this.state.players.get(sessionId);
      if (!player) continue;
      const [x, y, z] = body.position;
      player.x = x;
      player.y = y;
      player.z = z;
    }

    this.onSimulationTick(dt);
  }

  protected onSimulationTick(_dt: number): void {
    // Hook for subclasses (checkpoint checks, bot AI, respawn timers, ...).
  }

  protected async reportScore(userId: string, username: string, score: number): Promise<void> {
    await backendClient.submitScore(this.gameDbId, userId, username, score);
  }

  protected async reportAchievement(userId: string, key: string): Promise<void> {
    await backendClient.unlockAchievement(userId, key);
  }
}
