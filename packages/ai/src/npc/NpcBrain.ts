import Anthropic from "@anthropic-ai/sdk";
import type { NpcDefinition, NpcMemoryTurn, Quest, PlayerQuestProgress } from "@nova/shared";
import { QuestState } from "@nova/shared";
import type { NpcMemoryStore } from "./NpcMemory";

export interface NpcBrainOptions {
  apiKey?: string;
  model?: string;
  memoryStore: NpcMemoryStore;
}

export interface NpcTalkResult {
  reply: string;
  usedLlm: boolean;
}

const FALLBACK_LINES = [
  "Witaj, podróżniku! Jak mogę Ci pomóc?",
  "Piękny dziś dzień na przygodę, prawda?",
  "Słyszałem, że w pobliżu grasują potwory. Uważaj na siebie.",
  "Wróć do mnie, gdy wykonasz zadanie, dostaniesz nagrodę.",
];

/**
 * Drives conversational NPCs. When an Anthropic API key is configured it calls the
 * real model (claude-sonnet-5 by default) with the NPC's persona, quest state and
 * recent memory; otherwise it degrades to simple rule-based lines so the platform
 * still runs fully offline/out-of-the-box.
 */
export class NpcBrain {
  private client: Anthropic | null;
  private model: string;
  private memoryStore: NpcMemoryStore;

  constructor(options: NpcBrainOptions) {
    this.client = options.apiKey ? new Anthropic({ apiKey: options.apiKey }) : null;
    this.model = options.model ?? "claude-sonnet-5";
    this.memoryStore = options.memoryStore;
  }

  async talk(
    npc: NpcDefinition,
    userId: string,
    playerMessage: string,
    quest: Quest | null,
    questProgress: PlayerQuestProgress | null
  ): Promise<NpcTalkResult> {
    const history = await this.memoryStore.getTurns(npc.id, userId);

    let reply: string;
    let usedLlm = false;

    if (this.client) {
      reply = await this.callLlm(npc, history, playerMessage, quest, questProgress);
      usedLlm = true;
    } else {
      reply = this.fallbackReply(npc, playerMessage, quest, questProgress);
    }

    await this.memoryStore.appendTurn(npc.id, userId, { role: "player", text: playerMessage, at: new Date().toISOString() });
    await this.memoryStore.appendTurn(npc.id, userId, { role: "npc", text: reply, at: new Date().toISOString() });

    return { reply, usedLlm };
  }

  private async callLlm(
    npc: NpcDefinition,
    history: NpcMemoryTurn[],
    playerMessage: string,
    quest: Quest | null,
    questProgress: PlayerQuestProgress | null
  ): Promise<string> {
    const questContext = quest
      ? `Aktualny quest NPC to "${quest.title}": ${quest.description}. Status gracza: ${questProgress?.state ?? QuestState.NOT_STARTED}.`
      : "Ten NPC nie ma obecnie żadnego questa do zaoferowania.";

    const systemPrompt = [
      `Jesteś NPC w grze o nazwie "${npc.name}". Twoja osobowość: ${npc.persona}.`,
      questContext,
      "Odpowiadaj krótko (maks. 3 zdania), zostań w postaci, mów po polsku, nie wspominaj że jesteś modelem językowym.",
    ].join("\n");

    const messages = history.map((turn) => ({
      role: turn.role === "player" ? ("user" as const) : ("assistant" as const),
      content: turn.text,
    }));
    messages.push({ role: "user", content: playerMessage });

    try {
      const response = await this.client!.messages.create({
        model: this.model,
        max_tokens: 300,
        system: systemPrompt,
        messages,
      });
      const textBlock = response.content.find((block) => block.type === "text");
      return textBlock && "text" in textBlock ? textBlock.text : this.fallbackReply(npc, playerMessage, quest, questProgress);
    } catch (err) {
      console.error("NPC LLM call failed, falling back to scripted reply", err);
      return this.fallbackReply(npc, playerMessage, quest, questProgress);
    }
  }

  private fallbackReply(npc: NpcDefinition, playerMessage: string, quest: Quest | null, questProgress: PlayerQuestProgress | null): string {
    const lower = playerMessage.toLowerCase();
    if (quest && (lower.includes("quest") || lower.includes("zadanie"))) {
      if (questProgress?.state === QuestState.COMPLETED) {
        return `Dziękuję za wykonanie zadania "${quest.title}"! Twoja nagroda już czeka w ekwipunku.`;
      }
      return `Mam dla Ciebie zadanie: "${quest.title}" - ${quest.description}`;
    }
    const hashSeed = [...playerMessage].reduce((acc, c) => acc + c.charCodeAt(0), npc.name.length);
    return FALLBACK_LINES[hashSeed % FALLBACK_LINES.length];
  }
}
