import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { InviteType } from "@nova/shared";
import { UserEntity } from "./user.entity";

@Entity({ name: "invites" })
export class InviteEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "enum", enum: InviteType })
  type!: InviteType;

  @ManyToOne(() => UserEntity, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "fromUserId" })
  fromUser!: UserEntity;

  @Column()
  fromUserId!: string;

  @ManyToOne(() => UserEntity, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "toUserId" })
  toUser!: UserEntity;

  @Column()
  toUserId!: string;

  @Column()
  targetId!: string;

  @Column({ default: "" })
  message!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
