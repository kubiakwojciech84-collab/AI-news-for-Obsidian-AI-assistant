import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { QuestObjective } from "@nova/shared";

@Entity({ name: "quests" })
export class QuestEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  npcId!: string;

  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Column({ type: "jsonb", default: [] })
  objectives!: QuestObjective[];

  @Column({ default: 0 })
  coinReward!: number;

  @Column({ default: 0 })
  xpReward!: number;
}
