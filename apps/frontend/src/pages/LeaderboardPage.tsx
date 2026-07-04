import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "@nova/shared";
import { LeaderboardApi } from "../api/endpoints";

export function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    LeaderboardApi.global().then(setEntries);
  }, []);

  return (
    <main className="page">
      <h1>Ranking globalny (XP)</h1>
      <table className="card">
        <thead>
          <tr>
            <th>#</th>
            <th>Gracz</th>
            <th>XP</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.userId}>
              <td>{e.rank}</td>
              <td>{e.username}</td>
              <td>{e.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
