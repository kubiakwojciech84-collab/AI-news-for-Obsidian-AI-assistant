import { CharacterBody } from "@nova/physics";
import { BotBrain, BotBlackboard, BotDecision, BotProfile, GridNavGraph } from "@nova/ai";

export interface BotControllerOptions {
  id: string;
  displayName: string;
  spawn: [number, number, number];
  nav: GridNavGraph;
  profile: Partial<BotProfile>;
  maxHealth?: number;
}

/**
 * Couples a physics CharacterBody with a BotBrain FSM so a room can drive a bot exactly
 * like a real player: read its blackboard, get a decision, apply movement/actions.
 */
export class BotController {
  readonly id: string;
  readonly displayName: string;
  readonly body: CharacterBody;
  readonly brain: BotBrain;
  health: number;
  private readonly maxHealth: number;

  constructor(options: BotControllerOptions) {
    this.id = options.id;
    this.displayName = options.displayName;
    this.body = new CharacterBody({ position: options.spawn, moveSpeed: options.profile.moveSpeed ?? 4 });
    this.brain = new BotBrain(options.nav, options.profile);
    this.maxHealth = options.maxHealth ?? 100;
    this.health = this.maxHealth;
  }

  get position(): [number, number, number] {
    return this.body.position;
  }

  get isDead(): boolean {
    return this.health <= 0;
  }

  applyDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  respawn(spawn: [number, number, number]): void {
    this.health = this.maxHealth;
    this.body.teleport(spawn);
  }

  tick(bb: BotBlackboard): BotDecision {
    bb.selfHealth = this.health;
    const decision = this.brain.decide(bb);
    this.body.setMoveInput(decision.moveDirX, decision.moveDirZ, decision.yaw);
    if (decision.wantsJump) this.body.jump();
    return decision;
  }
}
