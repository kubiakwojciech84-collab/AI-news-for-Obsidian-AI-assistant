import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { QuestState } from "@nova/shared";

@Entity({ name: "player_quest_progress" })
export class PlayerQuestProgressEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @Column()
  questId!: string;

  @Column({ type: "enum", enum: QuestState, default: QuestState.NOT_STARTED })
  state!: QuestState;

  @Column({ type: "jsonb", default: {} })
  objectiveCounts!: Record<string, number>;

  @UpdateDateColumn()
  updatedAt!: Date;
}
