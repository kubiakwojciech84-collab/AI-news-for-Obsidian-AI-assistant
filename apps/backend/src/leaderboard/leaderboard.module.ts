import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../database/entities/user.entity";
import { GameScoreEntity } from "../database/entities/game-score.entity";
import { LeaderboardService } from "./leaderboard.service";
import { LeaderboardController } from "./leaderboard.controller";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, GameScoreEntity])],
  providers: [LeaderboardService],
  controllers: [LeaderboardController],
})
export class LeaderboardModule {}
