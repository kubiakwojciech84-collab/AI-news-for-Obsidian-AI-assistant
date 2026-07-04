import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

/** Stored symmetrically: one row per direction so lookups by userId are a simple index scan. */
@Entity({ name: "friendships" })
export class FriendshipEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: UserEntity;

  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "friendId" })
  friend!: UserEntity;

  @Column()
  friendId!: string;

  @CreateDateColumn()
  since!: Date;
}
