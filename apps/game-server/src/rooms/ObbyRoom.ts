import { Client } from "colyseus";
import { ServerMessage, ROOM_NAMES } from "@nova/shared";
import { BaseGameRoom, JoinOptions } from "./BaseGameRoom";

const FALL_RESET_Y = -15;
const CHECKPOINT_RADIUS = 2.2;
const GOAL_CHECKPOINT_INDEX = 99;

/**
 * The "Tower of Trials" obby: players race to the top of a spiraling platform tower.
 * Reaching each numbered checkpoint saves it as the player's respawn point; falling below
 * the map resets them there instead of to the start. No AI bots here - this genre is a
 * solo-paced platformer, so bot patrol/combat behaviour lives in ShooterRoom instead.
 */
export class ObbyRoom extends BaseGameRoom {
  private joinedAt = new Map<string, number>();
  private lastCheckpointPos = new Map<string, [number, number, number]>();
  private finished = new Set<string>();

  defaultGameSlug(): string {
    return "obby";
  }

  onJoin(client: Client, options: JoinOptions): void {
    super.onJoin(client, options);
    this.joinedAt.set(client.sessionId, Date.now());
    const spawn = this.spawnPoints[0] ?? { x: 0, y: 2, z: 0 };
    this.lastCheckpointPos.set(client.sessionId, [spawn.x, spawn.y, spawn.z]);
  }

  onLeave(client: Client): void {
    super.onLeave(client);
    this.joinedAt.delete(client.sessionId);
    this.lastCheckpointPos.delete(client.sessionId);
    this.finished.delete(client.sessionId);
  }

  protected spawnBots(): void {
    // Intentionally no bots in the obby - see class doc comment.
  }

  protected onSimulationTick(): void {
    for (const [sessionId, body] of this.characterBodies) {
      const player = this.state.players.get(sessionId);
      if (!player || this.finished.has(sessionId)) continue;

      for (const checkpoint of this.checkpoints) {
        const [px, , pz] = body.position;
        const dist = Math.hypot(px - checkpoint.x, pz - checkpoint.z);
        if (dist < CHECKPOINT_RADIUS && checkpoint.index > player.lastCheckpoint) {
          player.lastCheckpoint = checkpoint.index;
          this.lastCheckpointPos.set(sessionId, [checkpoint.x, checkpoint.y, checkpoint.z]);
          this.broadcast(ServerMessage.CHECKPOINT, { username: player.username, index: checkpoint.index });

          if (checkpoint.index === GOAL_CHECKPOINT_INDEX) {
            this.finished.add(sessionId);
            const elapsedMs = Date.now() - (this.joinedAt.get(sessionId) ?? Date.now());
            const score = Math.max(0, 100000 - elapsedMs);
            void this.reportScore(player.userId, player.username, score);
            void this.reportAchievement(player.userId, "obby_complete");
          }
        }
      }

      if (body.position[1] < FALL_RESET_Y) {
        const [x, y, z] = this.lastCheckpointPos.get(sessionId) ?? [0, 2, 0];
        body.teleport([x, y, z]);
      }
    }
  }
}

export const OBBY_ROOM_NAME = ROOM_NAMES.OBBY;
