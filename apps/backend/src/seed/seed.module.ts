import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../database/entities/user.entity";
import { GameEntity } from "../database/entities/game.entity";
import { ShopItemEntity } from "../database/entities/shop-item.entity";
import { AchievementEntity } from "../database/entities/achievement.entity";
import { NpcEntity } from "../database/entities/npc.entity";
import { QuestEntity } from "../database/entities/quest.entity";
import { SeedService } from "./seed.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, GameEntity, ShopItemEntity, AchievementEntity, NpcEntity, QuestEntity])],
  providers: [SeedService],
})
export class SeedModule {}
