import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { GameEntity } from "./entities/game.entity";
import { InventoryEntryEntity } from "./entities/inventory-entry.entity";
import { ShopItemEntity } from "./entities/shop-item.entity";
import { AchievementEntity } from "./entities/achievement.entity";
import { UserAchievementEntity } from "./entities/user-achievement.entity";
import { FriendRequestEntity } from "./entities/friend-request.entity";
import { FriendshipEntity } from "./entities/friendship.entity";
import { GroupEntity } from "./entities/group.entity";
import { GroupMembershipEntity } from "./entities/group-membership.entity";
import { InviteEntity } from "./entities/invite.entity";
import { ChatMessageEntity } from "./entities/chat-message.entity";
import { NpcEntity } from "./entities/npc.entity";
import { QuestEntity } from "./entities/quest.entity";
import { PlayerQuestProgressEntity } from "./entities/player-quest-progress.entity";
import { NpcMemoryTurnEntity } from "./entities/npc-memory-turn.entity";
import { ReportEntity } from "./entities/report.entity";
import { GameScoreEntity } from "./entities/game-score.entity";

export const ALL_ENTITIES = [
  UserEntity,
  GameEntity,
  InventoryEntryEntity,
  ShopItemEntity,
  AchievementEntity,
  UserAchievementEntity,
  FriendRequestEntity,
  FriendshipEntity,
  GroupEntity,
  GroupMembershipEntity,
  InviteEntity,
  ChatMessageEntity,
  NpcEntity,
  QuestEntity,
  PlayerQuestProgressEntity,
  NpcMemoryTurnEntity,
  ReportEntity,
  GameScoreEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("database.host"),
        port: config.get<number>("database.port"),
        username: config.get<string>("database.username"),
        password: config.get<string>("database.password"),
        database: config.get<string>("database.name"),
        entities: ALL_ENTITIES,
        // Fine for this scaffold/dev setup; swap for real migrations before production use.
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
