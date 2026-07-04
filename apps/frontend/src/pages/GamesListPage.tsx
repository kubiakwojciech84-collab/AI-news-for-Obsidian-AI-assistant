import { useEffect, useState } from "react";
import type { GameSummary } from "@nova/shared";
import { GamesApi } from "../api/endpoints";
import { GameCard } from "../components/GameCard";

export function GamesListPage() {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GamesApi.list()
      .then(setGames)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page">
      <h1>Wszystkie gry</h1>
      {loading && <p>Ladowanie...</p>}
      <div className="grid cols-3">
        {games.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>
    </main>
  );
}
