import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GameScene, GameStatus, GameSummary, createEmptyScene } from "@nova/shared";
import { GameEntity } from "../database/entities/game.entity";
import { CreateGameDto } from "./dto/create-game.dto";
import { UpdateGameDto } from "./dto/update-game.dto";

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "game"
  );
}

@Injectable()
export class GamesService {
  constructor(@InjectRepository(GameEntity) private games: Repository<GameEntity>) {}

  toSummary(game: GameEntity): GameSummary {
    return {
      id: game.id,
      slug: game.slug,
      title: game.title,
      description: game.description,
      genre: game.genre,
      status: game.status,
      thumbnailUrl: game.thumbnailUrl,
      authorId: game.authorId,
      authorName: game.author?.username ?? "unknown",
      playCount: game.playCount,
      likeCount: game.likeCount,
      maxPlayers: game.maxPlayers,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString(),
      published: game.published,
    };
  }

  async list(): Promise<GameEntity[]> {
    return this.games.find({ where: { published: true }, order: { playCount: "DESC" } });
  }

  async listMine(authorId: string): Promise<GameEntity[]> {
    return this.games.find({ where: { authorId }, order: { updatedAt: "DESC" } });
  }

  async getBySlug(slug: string): Promise<GameEntity> {
    const game = await this.games.findOne({ where: { slug } });
    if (!game) throw new NotFoundException("Game not found");
    return game;
  }

  async getById(id: string): Promise<GameEntity> {
    const game = await this.games.findOne({ where: { id } });
    if (!game) throw new NotFoundException("Game not found");
    return game;
  }

  async create(authorId: string, dto: CreateGameDto): Promise<GameEntity> {
    let slug = slugify(dto.title);
    const existing = await this.games.findOne({ where: { slug } });
    if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 7)}`;

    const game = this.games.create({
      authorId,
      slug,
      title: dto.title,
      description: dto.description,
      genre: dto.genre,
      maxPlayers: dto.maxPlayers,
      status: GameStatus.PROTOTYPE,
      published: false,
      scene: createEmptyScene(slug),
    });
    return this.games.save(game);
  }

  private assertOwner(game: GameEntity, userId: string): void {
    if (game.authorId !== userId) throw new ForbiddenException("You do not own this game");
  }

  async update(id: string, userId: string, dto: UpdateGameDto): Promise<GameEntity> {
    const game = await this.getById(id);
    this.assertOwner(game, userId);
    Object.assign(game, dto);
    return this.games.save(game);
  }

  async publishScene(id: string, userId: string, scene: GameScene): Promise<GameEntity> {
    const game = await this.getById(id);
    this.assertOwner(game, userId);
    game.scene = scene;
    game.status = GameStatus.PLAYABLE;
    return this.games.save(game);
  }

  async incrementPlayCount(id: string): Promise<void> {
    await this.games.increment({ id }, "playCount", 1);
  }

  async delete(id: string, userId: string): Promise<void> {
    const game = await this.getById(id);
    this.assertOwner(game, userId);
    await this.games.remove(game);
  }
}
