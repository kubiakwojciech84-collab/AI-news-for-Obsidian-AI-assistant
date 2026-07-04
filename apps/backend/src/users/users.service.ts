import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PublicUser, levelFromXp } from "@nova/shared";
import { UserEntity } from "../database/entities/user.entity";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(UserEntity) private users: Repository<UserEntity>) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async findByUsername(username: string): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { username } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  toPublic(user: UserEntity): PublicUser {
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      role: user.role,
      avatar: user.avatar,
      coins: user.coins,
      level: levelFromXp(user.xp),
      xp: user.xp,
      createdAt: user.createdAt.toISOString(),
      banned: user.banned,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<PublicUser> {
    const user = await this.findById(userId);
    if (dto.displayName !== undefined) user.displayName = dto.displayName;
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.avatar) user.avatar = { ...user.avatar, ...dto.avatar };
    await this.users.save(user);
    return this.toPublic(user);
  }

  async addCoins(userId: string, amount: number): Promise<void> {
    await this.users.increment({ id: userId }, "coins", amount);
  }

  async spendCoins(userId: string, amount: number): Promise<boolean> {
    const user = await this.findById(userId);
    if (user.coins < amount) return false;
    user.coins -= amount;
    await this.users.save(user);
    return true;
  }

  async addXp(userId: string, amount: number): Promise<void> {
    await this.users.increment({ id: userId }, "xp", amount);
  }

  async search(query: string): Promise<UserEntity[]> {
    return this.users
      .createQueryBuilder("u")
      .where("u.username ILIKE :q", { q: `%${query}%` })
      .limit(20)
      .getMany();
  }
}
