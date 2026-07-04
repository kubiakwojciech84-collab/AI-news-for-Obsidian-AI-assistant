import { GameGenre } from "../types/game";

export interface CreateGameDto {
  title: string;
  description: string;
  genre: GameGenre;
  maxPlayers: number;
}

export interface UpdateGameDto {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  maxPlayers?: number;
  published?: boolean;
}

export interface PublishSceneDto {
  scene: unknown;
}
