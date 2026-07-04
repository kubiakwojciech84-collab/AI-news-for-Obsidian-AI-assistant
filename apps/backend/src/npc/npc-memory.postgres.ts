import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { NpcMemoryStore } from "@nova/ai";
import type { NpcMemoryTurn } from "@nova/shared";
import { NpcMemoryTurnEntity } from "../database/entities/npc-memory-turn.entity";

@Injectable()
export class PostgresNpcMemoryStore implements NpcMemoryStore {
  constructor(@InjectRepository(NpcMemoryTurnEntity) private turns: Repository<NpcMemoryTurnEntity>) {}

  async getTurns(npcId: string, userId: string): Promise<NpcMemoryTurn[]> {
    const rows = await this.turns.find({ where: { npcId, userId }, order: { at: "DESC" }, take: 20 });
    return rows.reverse().map((r) => ({ role: r.role, text: r.text, at: r.at.toISOString() }));
  }

  async appendTurn(npcId: string, userId: string, turn: NpcMemoryTurn): Promise<void> {
    await this.turns.save(this.turns.create({ npcId, userId, role: turn.role, text: turn.text }));
  }
}
