import { useEffect, useState } from "react";
import { ModerationApi } from "../api/endpoints";

export function ModeratorPanelPage() {
  const [reports, setReports] = useState<any[]>([]);

  const reload = () => {
    ModerationApi.listOpen().then(setReports);
  };
  useEffect(reload, []);

  return (
    <main className="page">
      <h1>Panel Moderatora</h1>
      <h2>Otwarte zgloszenia</h2>
      <div className="grid cols-3">
        {reports.map((r) => (
          <div className="card" key={r.id}>
            <p>
              <strong>{r.targetType}</strong>: {r.targetId}
            </p>
            <p style={{ color: "var(--text-muted)" }}>{r.reason}</p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn"
                onClick={async () => {
                  await ModerationApi.resolve(r.id, "resolved");
                  reload();
                }}
              >
                Rozwiaz
              </button>
              <button
                className="btn secondary"
                onClick={async () => {
                  await ModerationApi.resolve(r.id, "dismissed");
                  reload();
                }}
              >
                Odrzuc
              </button>
              <button
                className="btn danger"
                onClick={async () => {
                  await ModerationApi.banUser(r.targetId, r.reason);
                  reload();
                }}
              >
                Zbanuj autora
              </button>
            </div>
          </div>
        ))}
        {reports.length === 0 && <p style={{ color: "var(--text-muted)" }}>Brak otwartych zgloszen.</p>}
      </div>
    </main>
  );
}
