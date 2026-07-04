import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole, AvatarConfig, DEFAULT_AVATAR } from "@nova/shared";
import { InventoryEntryEntity } from "./inventory-entry.entity";
import { GameEntity } from "./game.entity";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ default: "" })
  displayName!: string;

  @Column({ default: "" })
  bio!: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.PLAYER })
  role!: UserRole;

  @Column({ type: "jsonb", default: DEFAULT_AVATAR })
  avatar!: AvatarConfig;

  @Column({ default: 500 })
  coins!: number;

  @Column({ default: 0 })
  xp!: number;

  @Column({ default: false })
  banned!: boolean;

  @Column({ default: "" })
  banReason!: string;

  @OneToMany(() => InventoryEntryEntity, (entry) => entry.user)
  inventory!: InventoryEntryEntity[];

  @OneToMany(() => GameEntity, (game) => game.author)
  games!: GameEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
