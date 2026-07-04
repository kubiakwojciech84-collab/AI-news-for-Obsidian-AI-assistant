import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { GameSummary } from "@nova/shared";
import { GamesApi } from "../api/endpoints";
import { GameCard } from "../components/GameCard";
import { useAuth } from "../auth/AuthContext";

export function HomePage() {
  const { user } = useAuth();
  const [games, setGames] = useState<GameSummary[]>([]);

  useEffect(() => {
    GamesApi.list().then(setGames).catch(() => setGames([]));
  }, []);

  return (
    <main className="page">
      <section className="card" style={{ marginBottom: "1.5rem", textAlign: "center", padding: "3rem 1.5rem" }}>
        <h1>Witaj w NovaWorlds</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Otwarta platforma do tworzenia i grania w multiplayerowe gry 3D wprost w przegladarce.
        </p>
        {!user && (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
            <Link className="btn" to="/register">
              Zaloz konto
            </Link>
            <Link className="btn secondary" to="/games">
              Przegladaj gry
            </Link>
          </div>
        )}
        {user && (
          <a className="btn" href={import.meta.env.VITE_EDITOR_URL ?? "http://localhost:5174"} target="_blank" rel="noreferrer">
            Otworz Edytor (NovaStudio)
          </a>
        )}
      </section>

      <h2>Popularne gry</h2>
      <div className="grid cols-3">
        {games.slice(0, 9).map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>
    </main>
  );
}
