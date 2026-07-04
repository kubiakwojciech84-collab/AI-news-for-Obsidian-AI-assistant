import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

/** Persisted per-player conversation memory so NPCs "remember" a player across sessions. */
@Entity({ name: "npc_memory_turns" })
export class NpcMemoryTurnEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  npcId!: string;

  @Column()
  userId!: string;

  @Column({ type: "enum", enum: ["player", "npc"] })
  role!: "player" | "npc";

  @Column("text")
  text!: string;

  @CreateDateColumn()
  at!: Date;
}
