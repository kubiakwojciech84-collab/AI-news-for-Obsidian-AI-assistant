import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { InviteType } from "@nova/shared";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { InvitesService } from "./invites.service";
import { SendInviteDto } from "./dto/social.dto";

@ApiTags("invites")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("invites")
export class InvitesController {
  constructor(private invites: InvitesService) {}

  @Post()
  send(@CurrentUser() user: RequestUser, @Body() dto: SendInviteDto, @Query("type") type: InviteType = InviteType.FRIEND) {
    return this.invites.send(user.userId, type, dto.toUsername, dto.targetId, dto.message);
  }

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.invites.listForUser(user.userId);
  }

  @Delete(":id")
  dismiss(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.invites.dismiss(id, user.userId);
  }
}
