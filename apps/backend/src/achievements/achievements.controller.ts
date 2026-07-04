import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { InternalApiGuard } from "../common/internal-api.guard";
import { AchievementsService } from "./achievements.service";

class UnlockDto {
  @IsNotEmpty()
  userId!: string;

  @IsNotEmpty()
  achievementKey!: string;
}

@ApiTags("achievements")
@Controller("achievements")
export class AchievementsController {
  constructor(private achievements: AchievementsService) {}

  @Get()
  listAll() {
    return this.achievements.listAll();
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  listMine(@CurrentUser() user: RequestUser) {
    return this.achievements.listForUser(user.userId);
  }

  @Get("user/:username")
  listForUsername(@Param("username") username: string) {
    return this.achievements.listForUsername(username);
  }

  @Post("unlock")
  @UseGuards(InternalApiGuard)
  unlock(@Body() dto: UnlockDto) {
    return this.achievements.unlock(dto.userId, dto.achievementKey);
  }
}
