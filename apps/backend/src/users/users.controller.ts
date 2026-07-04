import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { UsersService } from "./users.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private users: UsersService) {}

  @Get("search")
  async search(@Query("q") q: string) {
    const results = await this.users.search(q ?? "");
    return results.map((u) => this.users.toPublic(u));
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: RequestUser) {
    return this.users.toPublic(await this.users.findById(user.userId));
  }

  @Patch("me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.userId, dto);
  }

  @Get(":username")
  async getByUsername(@Param("username") username: string) {
    return this.users.toPublic(await this.users.findByUsername(username));
  }
}
