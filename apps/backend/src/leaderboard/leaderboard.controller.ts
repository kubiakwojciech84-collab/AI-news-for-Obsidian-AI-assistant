import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsInt, IsNotEmpty } from "class-validator";
import { InternalApiGuard } from "../common/internal-api.guard";
import { LeaderboardService } from "./leaderboard.service";

class SubmitScoreDto {
  @IsNotEmpty() userId!: string;
  @IsNotEmpty() username!: string;
  @IsInt() score!: number;
}

@ApiTags("leaderboard")
@Controller("leaderboard")
export class LeaderboardController {
  constructor(private leaderboard: LeaderboardService) {}

  @Get("global")
  global() {
    return this.leaderboard.global();
  }

  @Get("game/:gameId")
  forGame(@Param("gameId") gameId: string) {
    return this.leaderboard.forGame(gameId);
  }

  @Post("game/:gameId/submit")
  @UseGuards(InternalApiGuard)
  submit(@Param("gameId") gameId: string, @Body() dto: SubmitScoreDto) {
    return this.leaderboard.submitScore(gameId, dto.userId, dto.username, dto.score);
  }
}
