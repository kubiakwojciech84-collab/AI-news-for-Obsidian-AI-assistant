import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { GameSummary } from "@nova/shared";
import { GameGenre } from "@nova/shared";
import { GamesApi } from "../api/endpoints";
import { useAuth } from "../auth/AuthContext";

export function ProjectPickerPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<GameSummary[]>([]);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<GameGenre>(GameGenre.OBBY);

  useEffect(() => {
    GamesApi.mine().then(setGames);
  }, []);

  const createGame = async (e: FormEvent) => {
    e.preventDefault();
    const game = await GamesApi.create({ title, description: "Nowy projekt", genre, maxPlayers: 12 });
    navigate(`/editor/${game.slug}`);
  };

  return (
    <main className="page">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Twoje projekty</h1>
        <div>
          <span style={{ marginRight: "1rem", color: "var(--text-muted)" }}>{user?.username}</span>
          <button className="btn secondary" onClick={logout}>
            Wyloguj
          </button>
        </div>
      </div>

      <form className="stack" onSubmit={createGame} style={{ marginBottom: "1.5rem" }}>
        <input placeholder="Tytul nowej gry" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select value={genre} onChange={(e) => setGenre(e.target.value as GameGenre)}>
          {Object.values(GameGenre).map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <button className="btn" type="submit">
          Utworz nowy projekt
        </button>
      </form>

      <div className="grid cols-3">
        {games.map((g) => (
          <div className="card" key={g.id}>
            <strong>{g.title}</strong>
            <p style={{ color: "var(--text-muted)" }}>{g.status}</p>
            <Link className="btn" to={`/editor/${g.slug}`}>
              Otworz w edytorze
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
