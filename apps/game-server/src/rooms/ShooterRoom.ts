import { Client } from "colyseus";
import { ServerMessage, FirePayload, ROOM_NAMES } from "@nova/shared";
import { PlayerState } from "@nova/networking";
import { BotBlackboard, VisiblePlayer } from "@nova/ai";
import { BaseGameRoom, JoinOptions } from "./BaseGameRoom";
import { BotController } from "../bots/BotController";

const MAX_HEALTH = 100;
const HIT_DAMAGE = 25;
const FIRE_RANGE = 40;
const FIRE_CONE_COS = Math.cos((18 * Math.PI) / 180);
const RESPAWN_DELAY_MS = 3000;
const BOT_FIRE_COOLDOWN_MS = 900;

interface Combatant {
  id: string;
  isBot: boolean;
  username: string;
  team: string;
  position: () => [number, number, number];
  applyDamage: (amount: number) => void;
  health: () => number;
  respawn: () => void;
}

/**
 * Team deathmatch FPS arena. Real players and AI bots share the exact same combat rules:
 * both fire hitscan shots resolved server-side, both take damage, respawn, and score.
 * Bots use @nova/ai's BotBrain in "combat" profile to patrol, chase, and attack.
 */
export class ShooterRoom extends BaseGameRoom {
  private bots: BotController[] = [];
  private botLastFireAt = new Map<string, number>();
  private killCounts = new Map<string, number>();
  private respawnTimers = new Map<string, NodeJS.Timeout>();
  private lastScoreReportAt = 0;

  defaultGameSlug(): string {
    return "shooter-fps";
  }

  onJoin(client: Client, options: JoinOptions): void {
    super.onJoin(client, options);
    const player = this.state.players.get(client.sessionId);
    if (player) player.health = MAX_HEALTH;
  }

  onLeave(client: Client): void {
    super.onLeave(client);
    const timer = this.respawnTimers.get(client.sessionId);
    if (timer) clearTimeout(timer);
    this.respawnTimers.delete(client.sessionId);
    this.killCounts.delete(client.sessionId);
  }

  protected spawnBots(): void {
    const botSpawns = this.spawnPoints.filter((s) => s.team === "bot");
    const spawns = botSpawns.length > 0 ? botSpawns : this.spawnPoints;

    spawns.forEach((spawn, i) => {
      const id = `bot-${i + 1}`;
      const controller = new BotController({
        id,
        displayName: `Bot ${i + 1}`,
        spawn: [spawn.x, spawn.y, spawn.z],
        nav: this.navGraph,
        profile: { canFight: true, canCollect: false, aggroRadius: 20, attackRadius: 14, moveSpeed: 3.5 },
      });
      this.physicsWorld.addBody(controller.body.body);
      this.bots.push(controller);

      const botState = new PlayerState();
      botState.userId = id;
      botState.username = controller.displayName;
      botState.isBot = true;
      botState.health = MAX_HEALTH;
      botState.x = spawn.x;
      botState.y = spawn.y;
      botState.z = spawn.z;
      this.state.players.set(id, botState);
    });
  }

  private allCombatants(): Combatant[] {
    const list: Combatant[] = [];
    for (const [sessionId, body] of this.characterBodies) {
      const player = this.state.players.get(sessionId);
      if (!player) continue;
      list.push({
        id: sessionId,
        isBot: false,
        username: player.username,
        team: "player",
        position: () => body.position,
        applyDamage: (amount) => this.damagePlayer(sessionId, amount),
        health: () => player.health,
        respawn: () => this.scheduleRespawn(sessionId),
      });
    }
    for (const bot of this.bots) {
      list.push({
        id: bot.id,
        isBot: true,
        username: bot.displayName,
        team: "bot",
        position: () => bot.position,
        applyDamage: (amount) => this.damageBot(bot, amount),
        health: () => bot.health,
        respawn: () => this.respawnBot(bot),
      });
    }
    return list;
  }

  protected handleFire(client: Client, payload: FirePayload): void {
    const shooter = this.state.players.get(client.sessionId);
    if (!shooter || shooter.eliminated) return;
    this.resolveHitscan(client.sessionId, shooter.username, payload, false);
  }

  private resolveHitscan(shooterId: string, shooterName: string, payload: FirePayload, shooterIsBot: boolean): void {
    const origin = { x: payload.originX, y: payload.originY, z: payload.originZ };
    const dir = normalize({ x: payload.dirX, y: payload.dirY, z: payload.dirZ });

    let bestTarget: Combatant | null = null;
    let bestDot = FIRE_CONE_COS;

    for (const combatant of this.allCombatants()) {
      if (combatant.id === shooterId || combatant.health() <= 0) continue;
      const [tx, ty, tz] = combatant.position();
      const toTarget = { x: tx - origin.x, y: ty - origin.y, z: tz - origin.z };
      const dist = Math.hypot(toTarget.x, toTarget.y, toTarget.z);
      if (dist > FIRE_RANGE || dist === 0) continue;
      const normalized = { x: toTarget.x / dist, y: toTarget.y / dist, z: toTarget.z / dist };
      const dot = dir.x * normalized.x + dir.y * normalized.y + dir.z * normalized.z;
      if (dot > bestDot) {
        bestDot = dot;
        bestTarget = combatant;
      }
    }

    if (!bestTarget) return;
    bestTarget.applyDamage(HIT_DAMAGE);
    this.broadcast(ServerMessage.HIT, { shooter: shooterName, target: bestTarget.username, damage: HIT_DAMAGE });

    if (bestTarget.health() <= 0) {
      this.broadcast(ServerMessage.ELIMINATED, { eliminated: bestTarget.username, by: shooterName });
      if (!shooterIsBot) {
        const kills = (this.killCounts.get(shooterId) ?? 0) + 1;
        this.killCounts.set(shooterId, kills);
        const shooterPlayer = this.state.players.get(shooterId);
        if (shooterPlayer) shooterPlayer.score = kills;
        if (kills === 1) void this.reportAchievement(shooterId, "shooter_first_kill");
      }
      bestTarget.respawn();
    }
  }

  private damagePlayer(sessionId: string, amount: number): void {
    const player = this.state.players.get(sessionId);
    if (!player) return;
    player.health = Math.max(0, player.health - amount);
    if (player.health <= 0) player.eliminated = true;
  }

  private scheduleRespawn(sessionId: string): void {
    const existing = this.respawnTimers.get(sessionId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => this.respawnPlayer(sessionId), RESPAWN_DELAY_MS);
    this.respawnTimers.set(sessionId, timer);
  }

  private damageBot(bot: BotController, amount: number): void {
    bot.applyDamage(amount);
    const state = this.state.players.get(bot.id);
    if (state) state.health = bot.health;
  }

  private respawnBot(bot: BotController): void {
    const spawn = this.pickSpawn("bot");
    setTimeout(() => {
      bot.respawn([spawn.x, spawn.y, spawn.z]);
      const state = this.state.players.get(bot.id);
      if (state) state.health = bot.health;
    }, RESPAWN_DELAY_MS);
  }

  protected onSimulationTick(): void {
    const combatants = this.allCombatants();
    const alivePlayers: VisiblePlayer[] = combatants
      .filter((c) => !c.isBot && c.health() > 0)
      .map((c) => {
        const [x, , z] = c.position();
        return { id: c.id, x, z, distance: 0 };
      });

    for (const bot of this.bots) {
      if (bot.isDead) continue;
      const [bx, , bz] = bot.position;
      const visiblePlayers: VisiblePlayer[] = alivePlayers.map((p) => ({ ...p, distance: Math.hypot(p.x - bx, p.z - bz) }));

      const bb: BotBlackboard = {
        selfX: bx,
        selfZ: bz,
        selfHealth: bot.health,
        visiblePlayers,
        visibleItems: [],
        patrolPoints: this.spawnPoints.map((s) => ({ x: s.x, z: s.z })),
        obstacles: this.staticObstacles.map((o) => ({
          x: (o.minX + o.maxX) / 2,
          z: (o.minZ + o.maxZ) / 2,
          radius: Math.max(o.maxX - o.minX, o.maxZ - o.minZ) / 2,
        })),
      };

      const decision = bot.tick(bb);
      const state = this.state.players.get(bot.id);
      if (state) {
        const [x, y, z] = bot.position;
        state.x = x;
        state.y = y;
        state.z = z;
        state.yaw = decision.yaw;
      }

      if (decision.wantsFire && decision.targetPlayerId) {
        const now = Date.now();
        const last = this.botLastFireAt.get(bot.id) ?? 0;
        if (now - last > BOT_FIRE_COOLDOWN_MS) {
          this.botLastFireAt.set(bot.id, now);
          const target = alivePlayers.find((p) => p.id === decision.targetPlayerId);
          if (target) {
            const [ox, oy, oz] = bot.position;
            const dir = normalize({ x: target.x - ox, y: 0, z: target.z - oz });
            this.resolveHitscan(bot.id, bot.displayName, { originX: ox, originY: oy, originZ: oz, dirX: dir.x, dirY: dir.y, dirZ: dir.z }, true);
          }
        }
      }
    }

    const now = Date.now();
    if (now - this.lastScoreReportAt > 15000) {
      this.lastScoreReportAt = now;
      for (const [sessionId, kills] of this.killCounts) {
        const player = this.state.players.get(sessionId);
        if (player) void this.reportScore(player.userId, player.username, kills);
      }
    }
  }
}

function normalize(v: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

export const SHOOTER_ROOM_NAME = ROOM_NAMES.SHOOTER;
