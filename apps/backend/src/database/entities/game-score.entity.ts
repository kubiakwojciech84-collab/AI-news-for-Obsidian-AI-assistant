import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

/** Best score per (game, user), used to render each game's leaderboard. */
@Entity({ name: "game_scores" })
export class GameScoreEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  gameId!: string;

  @Column()
  userId!: string;

  @Column()
  username!: string;

  @Column({ default: 0 })
  score!: number;

  @CreateDateColumn()
  achievedAt!: Date;
}
