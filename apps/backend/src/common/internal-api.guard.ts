import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Guards endpoints meant to be called server-to-server by apps/game-server (e.g. reporting
 * a completed quest, unlocking an achievement, updating a leaderboard) using a shared secret
 * instead of a player's JWT, since the game-server acts as a trusted backend client.
 */
@Injectable()
export class InternalApiGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const provided = request.headers["x-internal-api-key"];
    const expected = this.config.get<string>("internalApiKey");
    if (!expected || provided !== expected) {
      throw new UnauthorizedException("Invalid internal API key");
    }
    return true;
  }
}
