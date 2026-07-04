import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { GameGenre, GameStatus, GameScene, createEmptyScene } from "@nova/shared";
import { UserEntity } from "./user.entity";

@Entity({ name: "games" })
export class GameEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  slug!: string;

  @Column()
  title!: string;

  @Column({ default: "" })
  description!: string;

  @Column({ type: "enum", enum: GameGenre })
  genre!: GameGenre;

  @Column({ type: "enum", enum: GameStatus, default: GameStatus.PROTOTYPE })
  status!: GameStatus;

  @Column({ default: "" })
  thumbnailUrl!: string;

  @ManyToOne(() => UserEntity, (user) => user.games, { eager: true })
  @JoinColumn({ name: "authorId" })
  author!: UserEntity;

  @Column()
  authorId!: string;

  @Column({ default: 0 })
  playCount!: number;

  @Column({ default: 0 })
  likeCount!: number;

  @Column({ default: 20 })
  maxPlayers!: number;

  @Column({ default: false })
  published!: boolean;

  @Column({ type: "jsonb" })
  scene!: GameScene;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  static blank(authorId: string, slug: string): Partial<GameEntity> {
    return { authorId, slug, scene: createEmptyScene(slug) };
  }
}
