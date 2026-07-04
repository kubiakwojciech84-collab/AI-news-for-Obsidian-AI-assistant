import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FriendRequestStatus } from "@nova/shared";
import { UserEntity } from "./user.entity";

@Entity({ name: "friend_requests" })
export class FriendRequestEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

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

  @Column({ type: "enum", enum: FriendRequestStatus, default: FriendRequestStatus.PENDING })
  status!: FriendRequestStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
