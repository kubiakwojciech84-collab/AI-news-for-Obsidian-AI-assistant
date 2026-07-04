import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { GroupsService } from "./groups.service";
import { CreateGroupDto } from "./dto/social.dto";

@ApiTags("groups")
@Controller("groups")
export class GroupsController {
  constructor(private groups: GroupsService) {}

  @Get()
  list() {
    return this.groups.list();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.groups.get(id);
  }

  @Get(":id/members")
  members(@Param("id") id: string) {
    return this.groups.members(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateGroupDto) {
    return this.groups.create(user.userId, dto);
  }

  @Post(":id/join")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  join(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.groups.join(id, user.userId);
  }

  @Post(":id/leave")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  leave(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.groups.leave(id, user.userId);
  }
}
