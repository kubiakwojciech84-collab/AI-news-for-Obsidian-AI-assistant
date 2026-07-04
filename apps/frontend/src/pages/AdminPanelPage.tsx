import { useEffect, useState } from "react";
import type { PublicUser, GameSummary } from "@nova/shared";
import { AdminApi } from "../api/endpoints";

export function AdminPanelPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [games, setGames] = useState<GameSummary[]>([]);

  const reload = () => {
    AdminApi.stats().then(setStats);
    AdminApi.users().then(setUsers);
    AdminApi.games().then(setGames);
  };
  useEffect(reload, []);

  return (
    <main className="page">
      <h1>Panel Administratora</h1>
      {stats && (
        <div className="grid cols-3" style={{ marginBottom: "1.5rem" }}>
          <div className="card">Uzytkownicy: {stats.totalUsers}</div>
          <div className="card">Gry: {stats.totalGames} ({stats.publishedGames} opublikowanych)</div>
          <div className="card">Zbanowani: {stats.bannedUsers}</div>
        </div>
      )}

      <h2>Uzytkownicy</h2>
      <table className="card">
        <thead>
          <tr>
            <th>Login</th>
            <th>Rola</th>
            <th>Status</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>
                <select value={u.role} onChange={async (e) => { await AdminApi.setRole(u.id, e.target.value); reload(); }}>
                  <option value="player">player</option>
                  <option value="moderator">moderator</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td>{u.banned ? "Zbanowany" : "Aktywny"}</td>
              <td>
                <button className={`btn ${u.banned ? "secondary" : "danger"}`} onClick={async () => { await AdminApi.setBanned(u.id, !u.banned, "Naruszenie regulaminu"); reload(); }}>
                  {u.banned ? "Odbanuj" : "Zbanuj"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: "1.5rem" }}>Gry</h2>
      <table className="card">
        <thead>
          <tr>
            <th>Tytul</th>
            <th>Status</th>
            <th>Autor</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {games.map((g) => (
            <tr key={g.id}>
              <td>{g.title}</td>
              <td>{g.status}</td>
              <td>{g.authorName}</td>
              <td>
                <button className="btn danger" onClick={async () => { await AdminApi.removeGame(g.id); reload(); }}>
                  Usun
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
