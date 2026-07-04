import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AchievementEntity } from "../database/entities/achievement.entity";
import { UserAchievementEntity } from "../database/entities/user-achievement.entity";
import { UsersModule } from "../users/users.module";
import { AchievementsService } from "./achievements.service";
import { AchievementsController } from "./achievements.controller";

@Module({
  imports: [TypeOrmModule.forFeature([AchievementEntity, UserAchievementEntity]), UsersModule],
  providers: [AchievementsService],
  controllers: [AchievementsController],
  exports: [AchievementsService],
})
export class AchievementsModule {}
