import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NpcEntity } from "../database/entities/npc.entity";
import { QuestEntity } from "../database/entities/quest.entity";
import { PlayerQuestProgressEntity } from "../database/entities/player-quest-progress.entity";
import { NpcMemoryTurnEntity } from "../database/entities/npc-memory-turn.entity";
import { UsersModule } from "../users/users.module";
import { NpcService } from "./npc.service";
import { NpcController } from "./npc.controller";
import { PostgresNpcMemoryStore } from "./npc-memory.postgres";

@Module({
  imports: [TypeOrmModule.forFeature([NpcEntity, QuestEntity, PlayerQuestProgressEntity, NpcMemoryTurnEntity]), UsersModule],
  providers: [NpcService, PostgresNpcMemoryStore],
  controllers: [NpcController],
})
export class NpcModule {}
