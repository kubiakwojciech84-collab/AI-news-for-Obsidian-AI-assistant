import { useEffect, useState } from "react";
import type { InventoryEntry } from "@nova/shared";
import { ShopApi } from "../api/endpoints";

export function InventoryPage() {
  const [entries, setEntries] = useState<InventoryEntry[]>([]);

  const reload = () => ShopApi.inventory().then(setEntries);
  useEffect(reload, []);

  return (
    <main className="page">
      <h1>Ekwipunek</h1>
      <div className="grid cols-3">
        {entries.map((entry) => (
          <div className="card" key={entry.id}>
            <strong>{entry.item.name}</strong>
            <span className="badge">{entry.item.category}</span>
            <button
              className={`btn ${entry.equipped ? "secondary" : ""}`}
              onClick={async () => {
                await ShopApi.setEquipped(entry.id, !entry.equipped);
                reload();
              }}
            >
              {entry.equipped ? "Zdejmij" : "Zaloz"}
            </button>
          </div>
        ))}
        {entries.length === 0 && <p style={{ color: "var(--text-muted)" }}>Twoj ekwipunek jest pusty. Odwiedz sklep!</p>}
      </div>
    </main>
  );
}
