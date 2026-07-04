import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { NpcBrain } from "@nova/ai";
import { QuestState, NpcChatResponse } from "@nova/shared";
import { NpcEntity } from "../database/entities/npc.entity";
import { QuestEntity } from "../database/entities/quest.entity";
import { PlayerQuestProgressEntity } from "../database/entities/player-quest-progress.entity";
import { PostgresNpcMemoryStore } from "./npc-memory.postgres";
import { UsersService } from "../users/users.service";

@Injectable()
export class NpcService {
  private brain: NpcBrain;

  constructor(
    @InjectRepository(NpcEntity) private npcs: Repository<NpcEntity>,
    @InjectRepository(QuestEntity) private quests: Repository<QuestEntity>,
    @InjectRepository(PlayerQuestProgressEntity) private progress: Repository<PlayerQuestProgressEntity>,
    private config: ConfigService,
    private memoryStore: PostgresNpcMemoryStore,
    private users: UsersService
  ) {
    this.brain = new NpcBrain({
      apiKey: this.config.get<string>("anthropic.apiKey") || undefined,
      model: this.config.get<string>("anthropic.model"),
      memoryStore: this.memoryStore,
    });
  }

  listForGame(gameId: string): Promise<NpcEntity[]> {
    return this.npcs.find({ where: { gameId } });
  }

  async getQuestForNpc(npcId: string): Promise<QuestEntity | null> {
    const npc = await this.npcs.findOne({ where: { id: npcId } });
    if (!npc?.questId) return null;
    return this.quests.findOne({ where: { id: npc.questId } });
  }

  async getProgress(userId: string, questId: string): Promise<PlayerQuestProgressEntity> {
    let row = await this.progress.findOne({ where: { userId, questId } });
    if (!row) {
      row = await this.progress.save(this.progress.create({ userId, questId, state: QuestState.NOT_STARTED, objectiveCounts: {} }));
    }
    return row;
  }

  async talk(npcId: string, userId: string, message: string): Promise<NpcChatResponse> {
    const npcEntity = await this.npcs.findOne({ where: { id: npcId } });
    if (!npcEntity) throw new NotFoundException("NPC not found");

    const quest = await this.getQuestForNpc(npcId);
    let progressRow: PlayerQuestProgressEntity | null = null;
    if (quest) {
      progressRow = await this.getProgress(userId, quest.id);
      if (progressRow.state === QuestState.NOT_STARTED) {
        progressRow.state = QuestState.IN_PROGRESS;
        progressRow = await this.progress.save(progressRow);
      }
    }

    const { reply } = await this.brain.talk(
      { id: npcEntity.id, name: npcEntity.name, persona: npcEntity.persona, questId: npcEntity.questId, spawnNodeId: npcEntity.spawnNodeId },
      userId,
      message,
      quest
        ? { id: quest.id, npcId: quest.npcId, title: quest.title, description: quest.description, objectives: quest.objectives, coinReward: quest.coinReward, xpReward: quest.xpReward }
        : null,
      progressRow ? { questId: progressRow.questId, state: progressRow.state, objectiveCounts: progressRow.objectiveCounts } : null
    );

    return {
      npcId,
      reply,
      questProgress: progressRow
        ? { questId: progressRow.questId, state: progressRow.state, objectiveCounts: progressRow.objectiveCounts }
        : undefined,
    };
  }

  async completeObjective(userId: string, questId: string, objectiveId: string): Promise<PlayerQuestProgressEntity> {
    const quest = await this.quests.findOne({ where: { id: questId } });
    if (!quest) throw new NotFoundException("Quest not found");

    const row = await this.getProgress(userId, questId);
    const counts = { ...row.objectiveCounts };
    counts[objectiveId] = (counts[objectiveId] ?? 0) + 1;
    row.objectiveCounts = counts;

    const allDone = quest.objectives.every((o) => (counts[o.id] ?? 0) >= o.targetCount);
    if (allDone && row.state !== QuestState.COMPLETED) {
      row.state = QuestState.COMPLETED;
      await this.users.addCoins(userId, quest.coinReward);
      await this.users.addXp(userId, quest.xpReward);
    }
    return this.progress.save(row);
  }
}
