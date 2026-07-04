import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { NpcService } from "./npc.service";

class TalkDto {
  @IsNotEmpty() @MaxLength(500)
  message!: string;
}

@ApiTags("npc")
@Controller("npc")
export class NpcController {
  constructor(private npc: NpcService) {}

  @Get("game/:gameId")
  listForGame(@Param("gameId") gameId: string) {
    return this.npc.listForGame(gameId);
  }

  @Post(":id/talk")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  talk(@Param("id") id: string, @CurrentUser() user: RequestUser, @Body() dto: TalkDto) {
    return this.npc.talk(id, user.userId, dto.message);
  }

  @Post("quests/:questId/objectives/:objectiveId/complete")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  completeObjective(@CurrentUser() user: RequestUser, @Param("questId") questId: string, @Param("objectiveId") objectiveId: string) {
    return this.npc.completeObjective(user.userId, questId, objectiveId);
  }
}
