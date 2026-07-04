import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { GamesModule } from "./games/games.module";
import { SocialModule } from "./social/social.module";
import { InventoryModule } from "./inventory/inventory.module";
import { AchievementsModule } from "./achievements/achievements.module";
import { LeaderboardModule } from "./leaderboard/leaderboard.module";
import { ChatModule } from "./chat/chat.module";
import { AdminModule } from "./admin/admin.module";
import { ModerationModule } from "./moderation/moderation.module";
import { NpcModule } from "./npc/npc.module";
import { UploadsModule } from "./uploads/uploads.module";
import { SeedModule } from "./seed/seed.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    GamesModule,
    SocialModule,
    InventoryModule,
    AchievementsModule,
    LeaderboardModule,
    ChatModule,
    AdminModule,
    ModerationModule,
    NpcModule,
    UploadsModule,
    SeedModule,
  ],
})
export class AppModule {}
