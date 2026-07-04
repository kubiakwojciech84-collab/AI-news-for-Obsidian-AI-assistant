import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity({ name: "groups" })
export class GroupEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ default: "" })
  description!: string;

  @Column({ default: "" })
  iconUrl!: string;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: "ownerId" })
  owner!: UserEntity;

  @Column()
  ownerId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
