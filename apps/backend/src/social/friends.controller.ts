import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { FriendsService } from "./friends.service";
import { RespondFriendRequestDto, SendFriendRequestDto } from "./dto/social.dto";

@ApiTags("friends")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("friends")
export class FriendsController {
  constructor(private friends: FriendsService) {}

  @Post("requests")
  send(@CurrentUser() user: RequestUser, @Body() dto: SendFriendRequestDto) {
    return this.friends.sendRequest(user.userId, dto.toUsername);
  }

  @Get("requests")
  listIncoming(@CurrentUser() user: RequestUser) {
    return this.friends.listIncoming(user.userId);
  }

  @Post("requests/:id/respond")
  respond(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: RespondFriendRequestDto) {
    return this.friends.respond(id, user.userId, dto.accept);
  }

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.friends.listFriends(user.userId);
  }

  @Delete(":friendId")
  remove(@CurrentUser() user: RequestUser, @Param("friendId") friendId: string) {
    return this.friends.removeFriend(user.userId, friendId);
  }
}
