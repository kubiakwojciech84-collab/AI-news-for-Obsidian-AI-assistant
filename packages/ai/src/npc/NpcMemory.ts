import type { NpcMemoryTurn } from "@nova/shared";

export interface NpcMemoryStore {
  getTurns(npcId: string, userId: string): Promise<NpcMemoryTurn[]>;
  appendTurn(npcId: string, userId: string, turn: NpcMemoryTurn): Promise<void>;
}

/** Default in-process memory store; apps/backend swaps this for a Postgres-backed one. */
export class InMemoryNpcMemoryStore implements NpcMemoryStore {
  private store = new Map<string, NpcMemoryTurn[]>();
  private readonly maxTurns = 20;

  private key(npcId: string, userId: string): string {
    return `${npcId}:${userId}`;
  }

  async getTurns(npcId: string, userId: string): Promise<NpcMemoryTurn[]> {
    return this.store.get(this.key(npcId, userId)) ?? [];
  }

  async appendTurn(npcId: string, userId: string, turn: NpcMemoryTurn): Promise<void> {
    const key = this.key(npcId, userId);
    const turns = this.store.get(key) ?? [];
    turns.push(turn);
    while (turns.length > this.maxTurns) turns.shift();
    this.store.set(key, turns);
  }
}
