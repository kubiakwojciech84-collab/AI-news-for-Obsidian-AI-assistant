import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserRole } from "@nova/shared";
import { UserEntity } from "../database/entities/user.entity";
import { GameEntity } from "../database/entities/game.entity";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity) private users: Repository<UserEntity>,
    @InjectRepository(GameEntity) private games: Repository<GameEntity>
  ) {}

  listUsers(): Promise<UserEntity[]> {
    return this.users.find({ order: { createdAt: "DESC" } });
  }

  async setBanned(userId: string, banned: boolean, reason = ""): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    user.banned = banned;
    user.banReason = banned ? reason : "";
    return this.users.save(user);
  }

  async setRole(userId: string, role: UserRole): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    user.role = role;
    return this.users.save(user);
  }

  listAllGames(): Promise<GameEntity[]> {
    return this.games.find({ order: { createdAt: "DESC" } });
  }

  async removeGame(gameId: string): Promise<void> {
    await this.games.delete({ id: gameId });
  }

  async stats(): Promise<{ totalUsers: number; totalGames: number; publishedGames: number; bannedUsers: number }> {
    const [totalUsers, totalGames, publishedGames, bannedUsers] = await Promise.all([
      this.users.count(),
      this.games.count(),
      this.games.count({ where: { published: true } }),
      this.users.count({ where: { banned: true } }),
    ]);
    return { totalUsers, totalGames, publishedGames, bannedUsers };
  }
}
