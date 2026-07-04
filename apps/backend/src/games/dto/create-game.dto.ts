import { IsEnum, IsInt, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import { GameGenre } from "@nova/shared";

export class CreateGameDto {
  @IsString() @MinLength(3) @MaxLength(60)
  title!: string;

  @IsString() @MaxLength(500)
  description!: string;

  @IsEnum(GameGenre)
  genre!: GameGenre;

  @IsInt() @Min(1) @Max(100)
  maxPlayers!: number;
}
