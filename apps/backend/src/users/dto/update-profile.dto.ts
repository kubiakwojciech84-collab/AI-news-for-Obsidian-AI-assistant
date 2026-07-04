import { IsOptional, IsString, MaxLength } from "class-validator";

export class AvatarPatchDto {
  @IsOptional() @IsString() bodyColor?: string;
  @IsOptional() @IsString() headColor?: string;
  @IsOptional() hatId?: string | null;
  @IsOptional() shirtId?: string | null;
  @IsOptional() pantsId?: string | null;
  @IsOptional() faceId?: string | null;
  @IsOptional() accessoryIds?: string[];
}

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(30)
  displayName?: string;

  @IsOptional() @IsString() @MaxLength(300)
  bio?: string;

  @IsOptional()
  avatar?: AvatarPatchDto;
}
