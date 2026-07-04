import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { GamesService } from "./games.service";
import { CreateGameDto } from "./dto/create-game.dto";
import { PublishSceneDto, UpdateGameDto } from "./dto/update-game.dto";

@ApiTags("games")
@Controller("games")
export class GamesController {
  constructor(private games: GamesService) {}

  @Get()
  async list() {
    const games = await this.games.list();
    return games.map((g) => this.games.toSummary(g));
  }

  @Get("mine")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async listMine(@CurrentUser() user: RequestUser) {
    const games = await this.games.listMine(user.userId);
    return games.map((g) => this.games.toSummary(g));
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: RequestUser, @Body() dto: CreateGameDto) {
    const game = await this.games.create(user.userId, dto);
    return this.games.toSummary(game);
  }

  @Get(":slug")
  async getBySlug(@Param("slug") slug: string) {
    return this.games.getBySlug(slug);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(@Param("id") id: string, @CurrentUser() user: RequestUser, @Body() dto: UpdateGameDto) {
    const game = await this.games.update(id, user.userId, dto);
    return this.games.toSummary(game);
  }

  @Post(":id/publish")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async publish(@Param("id") id: string, @CurrentUser() user: RequestUser, @Body() dto: PublishSceneDto) {
    const game = await this.games.publishScene(id, user.userId, dto.scene as never);
    return this.games.toSummary(game);
  }

  @Post(":id/play")
  async incrementPlay(@Param("id") id: string) {
    await this.games.incrementPlayCount(id);
    return { ok: true };
  }

  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async remove(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    await this.games.delete(id, user.userId);
    return { ok: true };
  }
}
