import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LeaderboardEntry } from "@nova/shared";
import { UserEntity } from "../database/entities/user.entity";
import { GameScoreEntity } from "../database/entities/game-score.entity";

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(UserEntity) private users: Repository<UserEntity>,
    @InjectRepository(GameScoreEntity) private scores: Repository<GameScoreEntity>
  ) {}

  async global(): Promise<LeaderboardEntry[]> {
    const top = await this.users.find({ order: { xp: "DESC" }, take: 50 });
    return top.map((u, i) => ({ rank: i + 1, userId: u.id, username: u.username, score: u.xp }));
  }

  async forGame(gameId: string): Promise<LeaderboardEntry[]> {
    const rows = await this.scores
      .createQueryBuilder("s")
      .where("s.gameId = :gameId", { gameId })
      .orderBy("s.score", "DESC")
      .limit(50)
      .getMany();
    return rows.map((r, i) => ({ rank: i + 1, userId: r.userId, username: r.username, score: r.score }));
  }

  async submitScore(gameId: string, userId: string, username: string, score: number): Promise<void> {
    const existing = await this.scores.findOne({ where: { gameId, userId } });
    if (existing) {
      if (score > existing.score) {
        existing.score = score;
        await this.scores.save(existing);
      }
      return;
    }
    await this.scores.save(this.scores.create({ gameId, userId, username, score }));
  }
}
