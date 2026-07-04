import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GameEngine, buildScene, ThirdPersonCamera, FirstPersonCamera } from "@nova/engine3d";
import { GameClient, GameRoomState, PlayerState } from "@nova/networking";
import { ClientMessage, ServerMessage, GameGenre, GameScene, ROOM_NAMES, RoomName } from "@nova/shared";
import type { Room } from "colyseus.js";
import { GAME_SERVER_URL } from "../api/client";
import { useAuth } from "../auth/AuthContext";

interface GameCanvasProps {
  gameId: string;
  slug: string;
  genre: GameGenre;
  scene: GameScene;
  onEvent: (line: string) => void;
}

function roomNameForGenre(genre: GameGenre): RoomName {
  if (genre === GameGenre.SHOOTER) return ROOM_NAMES.SHOOTER;
  return ROOM_NAMES.OBBY;
}

function makePlayerMesh(isBot: boolean, isSelf: boolean): THREE.Group {
  const group = new THREE.Group();
  const bodyColor = isSelf ? "#22c55e" : isBot ? "#ef4444" : "#6d5efc";
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1, 4, 8), new THREE.MeshStandardMaterial({ color: bodyColor }));
  body.position.y = 0.9;
  body.castShadow = true;
  group.add(body);
  return group;
}

export function GameCanvas({ gameId, slug, genre, scene, onEvent }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { user, token } = useAuth();
  const [health, setHealth] = useState(100);
  const [checkpoint, setCheckpointIdx] = useState(0);
  const [players, setPlayers] = useState<Array<{ id: string; username: string; isBot: boolean; score: number; health: number }>>([]);

  useEffect(() => {
    if (!user || !token || !containerRef.current) return;
    let disposed = false;
    let room: Room<GameRoomState> | null = null;
    const engine = new GameEngine({ container: containerRef.current, skyColor: scene.skyColor });
    const isShooter = genre === GameGenre.SHOOTER;
    const thirdPerson = isShooter ? null : new ThirdPersonCamera(engine.camera);
    const firstPerson = isShooter ? new FirstPersonCamera(engine.camera) : null;
    const remoteMeshes = new Map<string, THREE.Group>();
    let selfSessionId: string | null = null;
    let inputSeq = 0;

    (async () => {
      const built = await buildScene(scene);
      if (disposed) return;
      engine.scene.add(built.root);

      const client = new GameClient(GAME_SERVER_URL);
      room = await client.join(roomNameForGenre(genre), { userId: user.id, username: user.username, accessToken: token, gameId: slug });
      if (disposed) {
        room.leave();
        return;
      }

      room.onMessage(ServerMessage.WELCOME, (payload: { sessionId: string }) => {
        selfSessionId = payload.sessionId;
      });
      room.onMessage(ServerMessage.CHAT, (payload: { username: string; body: string }) => onEvent(`${payload.username}: ${payload.body}`));
      room.onMessage(ServerMessage.HIT, (payload: { shooter: string; target: string; damage: number }) =>
        onEvent(`${payload.shooter} trafil ${payload.target} (-${payload.damage} HP)`)
      );
      room.onMessage(ServerMessage.ELIMINATED, (payload: { eliminated: string; by: string }) => onEvent(`${payload.by} wyeliminowal ${payload.eliminated}`));
      room.onMessage(ServerMessage.CHECKPOINT, (payload: { username: string; index: number }) => {
        onEvent(`${payload.username} osiagnal checkpoint ${payload.index}`);
      });

      const syncPlayersList = () => {
        const list: Array<{ id: string; username: string; isBot: boolean; score: number; health: number }> = [];
        room!.state.players.forEach((p: PlayerState, id: string) => {
          list.push({ id, username: p.username, isBot: p.isBot, score: p.score, health: p.health });
        });
        setPlayers(list);
      };

      room.state.players.onAdd((player: PlayerState, sessionId: string) => {
        if (sessionId !== selfSessionId) {
          const mesh = makePlayerMesh(player.isBot, false);
          engine.scene.add(mesh);
          remoteMeshes.set(sessionId, mesh);
        }
        syncPlayersList();
      });
      room.state.players.onChange((player: PlayerState, sessionId: string) => {
        if (sessionId === selfSessionId) {
          setHealth(player.health);
          setCheckpointIdx(player.lastCheckpoint);
        }
        syncPlayersList();
      });
      room.state.players.onRemove((_player: PlayerState, sessionId: string) => {
        const mesh = remoteMeshes.get(sessionId);
        if (mesh) engine.scene.remove(mesh);
        remoteMeshes.delete(sessionId);
        syncPlayersList();
      });

      engine.start();

      engine.onUpdate((dt) => {
        if (!room) return;
        const input = engine.input;
        if (input.isPointerLocked) {
          const { dx, dy } = input.lookDelta;
          thirdPerson?.applyLookDelta(dx, dy);
          firstPerson?.applyLookDelta(dx, dy);
        }

        const axis = input.moveAxis;
        const yaw = thirdPerson?.yaw ?? firstPerson?.yaw ?? 0;
        inputSeq += 1;
        room.send(ClientMessage.MOVE_INPUT, { seq: inputSeq, x: axis.x, z: axis.z, yaw, dtMs: dt * 1000 });
        if (input.wasJustPressed("Space")) room.send(ClientMessage.JUMP);
        if (isShooter && input.wasClicked(0)) {
          const forward = firstPerson!.forward;
          room.send(ClientMessage.FIRE, {
            originX: engine.camera.position.x,
            originY: engine.camera.position.y,
            originZ: engine.camera.position.z,
            dirX: forward.x,
            dirY: forward.y,
            dirZ: forward.z,
          });
        }

        const selfPlayer = selfSessionId ? room.state.players.get(selfSessionId) : undefined;
        const selfPos = new THREE.Vector3(selfPlayer?.x ?? 0, selfPlayer?.y ?? 1, selfPlayer?.z ?? 0);
        thirdPerson?.update(selfPos);
        firstPerson?.update(selfPos.clone().add(new THREE.Vector3(0, 0.7, 0)));

        room.state.players.forEach((p: PlayerState, sessionId: string) => {
          const mesh = remoteMeshes.get(sessionId);
          if (mesh) {
            mesh.position.lerp(new THREE.Vector3(p.x, p.y, p.z), 0.4);
            mesh.rotation.y = p.yaw;
          }
        });
      });
    })();

    return () => {
      disposed = true;
      room?.leave();
      engine.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, slug, genre]);

  return (
    <div className="game-canvas-container" ref={containerRef}>
      <div className="game-hud">
        <div>Zdrowie: {health}</div>
        {genre !== GameGenre.SHOOTER && <div>Checkpoint: {checkpoint}</div>}
        <div style={{ marginTop: "0.5rem" }}>
          {players.slice(0, 8).map((p) => (
            <div key={p.id}>
              {p.isBot ? "🤖 " : "🧑 "}
              {p.username} {genre === GameGenre.SHOOTER ? `- ${p.score} pkt` : ""}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "0.5rem", opacity: 0.7 }}>Kliknij, aby zablokowac kursor. WASD - ruch, Spacja - skok{genre === GameGenre.SHOOTER ? ", LPM - strzal" : ""}.</div>
      </div>
      {genre === GameGenre.SHOOTER && <div className="crosshair" />}
    </div>
  );
}
