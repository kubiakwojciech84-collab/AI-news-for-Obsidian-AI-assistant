import { IsEmail, Matches, MinLength } from "class-validator";
import { PASSWORD_MIN_LENGTH, USERNAME_REGEX } from "@nova/shared";

export class RegisterDto {
  @Matches(USERNAME_REGEX, { message: "Username must be 3-20 chars: letters, numbers, underscore" })
  username!: string;

  @IsEmail()
  email!: string;

  @MinLength(PASSWORD_MIN_LENGTH)
  password!: string;
}
