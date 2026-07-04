import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class SendFriendRequestDto {
  @IsNotEmpty()
  toUsername!: string;
}

export class RespondFriendRequestDto {
  @IsBoolean()
  accept!: boolean;
}

export class CreateGroupDto {
  @IsString() @MaxLength(50)
  name!: string;

  @IsOptional() @IsString() @MaxLength(300)
  description?: string;
}

export class SendInviteDto {
  @IsNotEmpty()
  toUsername!: string;

  @IsNotEmpty()
  targetId!: string;

  @IsOptional() @IsString() @MaxLength(200)
  message?: string;
}
