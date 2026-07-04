import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GameStatus } from "@nova/shared";
import { GamesApi } from "../api/endpoints";
import { GameCanvas } from "../game/GameCanvas";

export function GamePlayPage() {
  const { slug } = useParams();
  const [game, setGame] = useState<any>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    GamesApi.bySlug(slug)
      .then((g) => {
        setGame(g);
        GamesApi.incrementPlay(g.id).catch(() => undefined);
      })
      .catch(() => setError("Nie znaleziono gry"));
  }, [slug]);

  if (error) return <main className="page">{error}</main>;
  if (!game) return <main className="page">Ladowanie gry...</main>;

  if (game.status !== GameStatus.PLAYABLE) {
    return (
      <main className="page">
        <h1>{game.title}</h1>
        <div className="card">
          <p>
            Ta gra jest obecnie <strong>prototypem</strong> w katalogu NovaWorlds - jej pelna rozgrywka jest w budowie.
          </p>
          <p>Otworz NovaStudio, aby dokonczyc jej implementacje: dodaj mape, skrypty i opublikuj gre.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="game-play-layout">
      <GameCanvas gameId={game.id} slug={game.slug} genre={game.genre} scene={game.scene} onEvent={(line) => setEvents((prev) => [...prev.slice(-6), line])} />
      <div style={{ position: "absolute", bottom: "1rem", left: "1rem", color: "white", textShadow: "0 1px 3px black", fontSize: "0.85rem" }}>
        {events.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}
