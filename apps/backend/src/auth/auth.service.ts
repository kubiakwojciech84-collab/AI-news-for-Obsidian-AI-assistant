import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UserEntity } from "../database/entities/user.entity";
import { UserRole, DEFAULT_AVATAR, STARTING_COINS, AuthResponseDto } from "@nova/shared";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private users: Repository<UserEntity>,
    private jwt: JwtService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.users.findOne({ where: [{ username: dto.username }, { email: dto.email }] });
    if (existing) throw new ConflictException("Username or email already in use");

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.save(
      this.users.create({
        username: dto.username,
        email: dto.email,
        passwordHash,
        displayName: dto.username,
        role: UserRole.PLAYER,
        avatar: DEFAULT_AVATAR,
        coins: STARTING_COINS,
      })
    );
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.users.findOne({ where: [{ username: dto.usernameOrEmail }, { email: dto.usernameOrEmail }] });
    if (!user) throw new UnauthorizedException("Invalid credentials");
    if (user.banned) throw new UnauthorizedException(`Account banned: ${user.banReason || "policy violation"}`);

    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) throw new UnauthorizedException("Invalid credentials");

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: UserEntity): AuthResponseDto {
    const accessToken = this.jwt.sign({ sub: user.id, username: user.username, role: user.role });
    return {
      accessToken,
      user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role },
    };
  }
}
