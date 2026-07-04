import type { GameScene } from "@nova/shared";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000/api";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? "dev-internal-key-change-me";

/** Thin HTTP client the game-server uses to talk to the trusted NestJS backend. */
export const backendClient = {
  async getGameBySlug(slug: string): Promise<{ id: string; scene: GameScene; maxPlayers: number } | null> {
    try {
      const res = await fetch(`${BACKEND_URL}/games/${slug}`);
      if (!res.ok) return null;
      return (await res.json()) as { id: string; scene: GameScene; maxPlayers: number };
    } catch (err) {
      console.error("Failed to fetch game scene from backend", err);
      return null;
    }
  },

  async submitScore(gameId: string, userId: string, username: string, score: number): Promise<void> {
    try {
      await fetch(`${BACKEND_URL}/leaderboard/game/${gameId}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-internal-api-key": INTERNAL_API_KEY },
        body: JSON.stringify({ userId, username, score }),
      });
    } catch (err) {
      console.error("Failed to submit score to backend", err);
    }
  },

  async unlockAchievement(userId: string, achievementKey: string): Promise<void> {
    try {
      await fetch(`${BACKEND_URL}/achievements/unlock`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-internal-api-key": INTERNAL_API_KEY },
        body: JSON.stringify({ userId, achievementKey }),
      });
    } catch (err) {
      console.error("Failed to unlock achievement", err);
    }
  },
};
