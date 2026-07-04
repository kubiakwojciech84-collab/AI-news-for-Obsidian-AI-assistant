import { GridNavGraph, Vec2 } from "../pathfinding/GridNavGraph";
import { seek, avoidObstacles, CircleObstacle } from "../steering/Steering";

export enum BotState {
  PATROL = "patrol",
  CHASE = "chase",
  ATTACK = "attack",
  COLLECT = "collect",
  FLEE = "flee",
  IDLE = "idle",
}

export interface VisiblePlayer {
  id: string;
  x: number;
  z: number;
  distance: number;
}

export interface VisibleItem {
  id: string;
  x: number;
  z: number;
  distance: number;
}

export interface BotBlackboard {
  selfX: number;
  selfZ: number;
  selfHealth: number;
  visiblePlayers: VisiblePlayer[];
  visibleItems: VisibleItem[];
  patrolPoints: Vec2[];
  obstacles: CircleObstacle[];
}

export interface BotDecision {
  state: BotState;
  moveDirX: number;
  moveDirZ: number;
  yaw: number;
  wantsFire: boolean;
  wantsJump: boolean;
  targetPlayerId: string | null;
  collectItemId: string | null;
  reachedWaypoint: boolean;
}

export interface BotProfile {
  /** Combat bots (Shooter) chase and shoot; gatherer bots (Survival/Obby) collect items instead. */
  canFight: boolean;
  canCollect: boolean;
  aggroRadius: number;
  attackRadius: number;
  fleeHealthThreshold: number;
  moveSpeed: number;
}

const DEFAULT_PROFILE: BotProfile = {
  canFight: true,
  canCollect: true,
  aggroRadius: 18,
  attackRadius: 10,
  fleeHealthThreshold: 20,
  moveSpeed: 4,
};

/**
 * A finite-state-machine brain shared by every AI bot in the platform (Shooter enemies,
 * Survival/Obby gatherers, patrol guards). It consumes a per-tick "blackboard" snapshot
 * built by the game-server and returns a movement + action decision; the room applies
 * that decision to the bot's CharacterBody exactly like it would a real player's input.
 */
export class BotBrain {
  private state: BotState = BotState.PATROL;
  private currentPath: Vec2[] = [];
  private patrolIndex = 0;
  private profile: BotProfile;

  constructor(private nav: GridNavGraph, profile: Partial<BotProfile> = {}) {
    this.profile = { ...DEFAULT_PROFILE, ...profile };
  }

  decide(bb: BotBlackboard): BotDecision {
    const nearestPlayer = bb.visiblePlayers.sort((a, b) => a.distance - b.distance)[0] ?? null;
    const nearestItem = bb.visibleItems.sort((a, b) => a.distance - b.distance)[0] ?? null;

    this.transition(bb, nearestPlayer);

    let target: Vec2 | null = null;
    let targetPlayerId: string | null = null;
    let wantsFire = false;
    let collectItemId: string | null = null;

    switch (this.state) {
      case BotState.CHASE:
        if (nearestPlayer) {
          target = { x: nearestPlayer.x, z: nearestPlayer.z };
          targetPlayerId = nearestPlayer.id;
        }
        break;
      case BotState.ATTACK:
        if (nearestPlayer) {
          target = { x: nearestPlayer.x, z: nearestPlayer.z };
          targetPlayerId = nearestPlayer.id;
          wantsFire = true;
        }
        break;
      case BotState.COLLECT:
        if (nearestItem) {
          target = { x: nearestItem.x, z: nearestItem.z };
          collectItemId = nearestItem.distance < 1.2 ? nearestItem.id : null;
        }
        break;
      case BotState.FLEE:
        if (nearestPlayer) {
          target = { x: bb.selfX - (nearestPlayer.x - bb.selfX), z: bb.selfZ - (nearestPlayer.z - bb.selfZ) };
        }
        break;
      case BotState.PATROL:
      default:
        target = bb.patrolPoints[this.patrolIndex] ?? null;
        break;
    }

    let moveDirX = 0;
    let moveDirZ = 0;
    let yaw = 0;
    let reachedWaypoint = false;

    if (target) {
      const toTarget = seek({ x: bb.selfX, y: 0, z: bb.selfZ }, { x: target.x, y: 0, z: target.z });

      if (this.state === BotState.PATROL || this.state === BotState.COLLECT) {
        this.currentPath = this.ensurePath(bb, target);
        const waypoint = this.currentPath[0];
        if (waypoint) {
          const toWaypoint = seek({ x: bb.selfX, y: 0, z: bb.selfZ }, { x: waypoint.x, y: 0, z: waypoint.z });
          if (toWaypoint.distance < 0.75) {
            this.currentPath.shift();
            if (this.currentPath.length === 0 && this.state === BotState.PATROL) {
              this.patrolIndex = (this.patrolIndex + 1) % Math.max(bb.patrolPoints.length, 1);
              reachedWaypoint = true;
            }
          }
          const avoided = avoidObstacles({ x: bb.selfX, y: 0, z: bb.selfZ }, toWaypoint.x, toWaypoint.z, bb.obstacles);
          moveDirX = avoided.x;
          moveDirZ = avoided.z;
          yaw = Math.atan2(moveDirX, moveDirZ);
        }
      } else if (this.state === BotState.ATTACK) {
        yaw = toTarget.yaw;
      } else {
        const avoided = avoidObstacles({ x: bb.selfX, y: 0, z: bb.selfZ }, toTarget.x, toTarget.z, bb.obstacles);
        moveDirX = avoided.x;
        moveDirZ = avoided.z;
        yaw = toTarget.yaw;
      }
    }

    return {
      state: this.state,
      moveDirX,
      moveDirZ,
      yaw,
      wantsFire,
      wantsJump: false,
      targetPlayerId,
      collectItemId,
      reachedWaypoint,
    };
  }

  private ensurePath(bb: BotBlackboard, target: Vec2): Vec2[] {
    if (this.currentPath.length > 0) return this.currentPath;
    return this.nav.findPath({ x: bb.selfX, z: bb.selfZ }, target);
  }

  private transition(bb: BotBlackboard, nearestPlayer: VisiblePlayer | null): void {
    if (this.profile.canFight && bb.selfHealth <= this.profile.fleeHealthThreshold && nearestPlayer) {
      this.state = BotState.FLEE;
      return;
    }
    if (this.profile.canFight && nearestPlayer) {
      if (nearestPlayer.distance <= this.profile.attackRadius) {
        this.state = BotState.ATTACK;
        return;
      }
      if (nearestPlayer.distance <= this.profile.aggroRadius) {
        this.state = BotState.CHASE;
        this.currentPath = [];
        return;
      }
    }
    if (this.profile.canCollect && bb.visibleItems.length > 0) {
      this.state = BotState.COLLECT;
      return;
    }
    if (this.state !== BotState.PATROL) this.currentPath = [];
    this.state = BotState.PATROL;
  }
}
