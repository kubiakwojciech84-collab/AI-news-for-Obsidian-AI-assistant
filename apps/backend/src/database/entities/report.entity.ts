import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum ReportStatus {
  OPEN = "open",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
}

export enum ReportTargetType {
  USER = "user",
  GAME = "game",
  CHAT_MESSAGE = "chat_message",
}

/** Player-submitted report queued for a moderator to review in the moderator panel. */
@Entity({ name: "reports" })
export class ReportEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  reporterId!: string;

  @Column({ type: "enum", enum: ReportTargetType })
  targetType!: ReportTargetType;

  @Column()
  targetId!: string;

  @Column("text")
  reason!: string;

  @Column({ type: "enum", enum: ReportStatus, default: ReportStatus.OPEN })
  status!: ReportStatus;

  @Column({ nullable: true })
  resolvedByUserId!: string | null;

  @Column({ default: "" })
  resolutionNote!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
