import { Link } from "react-router-dom";
import type { GameSummary } from "@nova/shared";
import { GameStatus } from "@nova/shared";

const GENRE_ICONS: Record<string, string> = {
  obby: "🧗",
  survival: "🏕️",
  tycoon: "🏗️",
  shooter: "🔫",
  hide_and_seek: "🙈",
  racing: "🏎️",
  sandbox: "🧱",
  rpg: "🗡️",
  simulator: "☕",
};

export function GameCard({ game }: { game: GameSummary }) {
  return (
    <Link className="game-card card" to={`/games/${game.slug}`}>
      <div className="thumb">{GENRE_ICONS[game.genre] ?? "🎮"}</div>
      <strong>{game.title}</strong>
      <span className={`badge ${game.status === GameStatus.PLAYABLE ? "playable" : "prototype"}`}>
        {game.status === GameStatus.PLAYABLE ? "Grywalne" : "Prototyp"}
      </span>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>{game.description}</p>
      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
        {game.playCount} rozegranych - max {game.maxPlayers} graczy
      </span>
    </Link>
  );
}
