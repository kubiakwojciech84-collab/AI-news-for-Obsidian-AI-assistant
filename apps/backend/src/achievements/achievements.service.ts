import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AchievementEntity } from "../database/entities/achievement.entity";
import { UserAchievementEntity } from "../database/entities/user-achievement.entity";
import { UsersService } from "../users/users.service";

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(AchievementEntity) private achievements: Repository<AchievementEntity>,
    @InjectRepository(UserAchievementEntity) private unlocked: Repository<UserAchievementEntity>,
    private users: UsersService
  ) {}

  listAll(): Promise<AchievementEntity[]> {
    return this.achievements.find();
  }

  listForUser(userId: string): Promise<UserAchievementEntity[]> {
    return this.unlocked.find({ where: { userId }, order: { unlockedAt: "DESC" } });
  }

  async listForUsername(username: string): Promise<UserAchievementEntity[]> {
    const user = await this.users.findByUsername(username);
    return this.listForUser(user.id);
  }

  /** Called by the game-server (via internal API key) or backend logic when a bot/quest/game triggers an unlock. */
  async unlock(userId: string, achievementKey: string): Promise<UserAchievementEntity | null> {
    const achievement = await this.achievements.findOne({ where: { key: achievementKey } });
    if (!achievement) return null;

    const existing = await this.unlocked.findOne({ where: { userId, achievementId: achievement.id } });
    if (existing) return existing;

    await this.users.addCoins(userId, achievement.coinReward);
    await this.users.addXp(userId, achievement.xpReward);
    return this.unlocked.save(this.unlocked.create({ userId, achievementId: achievement.id }));
  }
}
