export interface NpcDefinition {
  id: string;
  name: string;
  persona: string;
  questId: string | null;
  spawnNodeId: string;
}

export enum QuestObjectiveType {
  TALK = "talk",
  COLLECT = "collect",
  REACH_LOCATION = "reach_location",
  DEFEAT = "defeat",
}

export interface QuestObjective {
  id: string;
  type: QuestObjectiveType;
  description: string;
  targetId: string;
  targetCount: number;
}

export interface Quest {
  id: string;
  npcId: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  coinReward: number;
  xpReward: number;
}

export enum QuestState {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

export interface PlayerQuestProgress {
  questId: string;
  state: QuestState;
  objectiveCounts: Record<string, number>;
}

/** One turn of remembered dialogue between a player and an AI NPC. */
export interface NpcMemoryTurn {
  role: "player" | "npc";
  text: string;
  at: string;
}

export interface NpcChatRequest {
  npcId: string;
  userId: string;
  message: string;
}

export interface NpcChatResponse {
  npcId: string;
  reply: string;
  questProgress?: PlayerQuestProgress;
}
