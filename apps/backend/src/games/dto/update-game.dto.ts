import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class UpdateGameDto {
  @IsOptional() @IsString() @MaxLength(60)
  title?: string;

  @IsOptional() @IsString() @MaxLength(500)
  description?: string;

  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @IsOptional() @IsInt() @Min(1) @Max(100)
  maxPlayers?: number;

  @IsOptional() @IsBoolean()
  published?: boolean;
}

export class PublishSceneDto {
  scene!: unknown;
}
