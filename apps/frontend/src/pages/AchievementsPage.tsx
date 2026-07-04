import { useEffect, useState } from "react";
import type { Achievement, UserAchievement } from "@nova/shared";
import { AchievementsApi } from "../api/endpoints";

export function AchievementsPage() {
  const [all, setAll] = useState<Achievement[]>([]);
  const [mine, setMine] = useState<UserAchievement[]>([]);

  useEffect(() => {
    AchievementsApi.all().then(setAll);
    AchievementsApi.mine().then(setMine);
  }, []);

  const unlockedKeys = new Set(mine.map((m) => m.achievement.key));

  return (
    <main className="page">
      <h1>Osiagniecia</h1>
      <div className="grid cols-3">
        {all.map((a) => (
          <div className="card" key={a.id} style={{ opacity: unlockedKeys.has(a.key) ? 1 : 0.5 }}>
            <strong>{a.title}</strong>
            <p style={{ color: "var(--text-muted)" }}>{a.description}</p>
            <p style={{ fontSize: "0.85rem" }}>
              +{a.coinReward} monet, +{a.xpReward} XP
            </p>
            {unlockedKeys.has(a.key) && <span className="badge playable">Odblokowane</span>}
          </div>
        ))}
      </div>
    </main>
  );
}
