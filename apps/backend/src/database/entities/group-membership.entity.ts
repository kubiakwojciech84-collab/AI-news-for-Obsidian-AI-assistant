import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GroupRole } from "@nova/shared";
import { UserEntity } from "./user.entity";
import { GroupEntity } from "./group.entity";

@Entity({ name: "group_memberships" })
export class GroupMembershipEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => GroupEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "groupId" })
  group!: GroupEntity;

  @Column()
  groupId!: string;

  @ManyToOne(() => UserEntity, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: UserEntity;

  @Column()
  userId!: string;

  @Column({ type: "enum", enum: GroupRole, default: GroupRole.MEMBER })
  role!: GroupRole;

  @CreateDateColumn()
  joinedAt!: Date;
}
