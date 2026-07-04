import { useEffect, useState } from "react";
import type { ShopItem } from "@nova/shared";
import { ShopApi } from "../api/endpoints";
import { useAuth } from "../auth/AuthContext";

export function ShopPage() {
  const { refreshUser } = useAuth();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    ShopApi.items().then(setItems);
  }, []);

  const buy = async (item: ShopItem) => {
    setMessage(null);
    try {
      await ShopApi.purchase(item.id);
      setMessage(`Kupiono: ${item.name}`);
      await refreshUser();
    } catch (err: any) {
      setMessage(err?.response?.data?.message ?? "Nie udalo sie kupic przedmiotu");
    }
  };

  return (
    <main className="page">
      <h1>Sklep</h1>
      {message && <p style={{ color: "var(--text-muted)" }}>{message}</p>}
      <div className="grid cols-3">
        {items.map((item) => (
          <div className="card" key={item.id}>
            <strong>{item.name}</strong>
            <span className="badge">{item.category}</span>
            <p style={{ color: "var(--text-muted)" }}>{item.description}</p>
            <p>{item.priceCoins} monet</p>
            <button className="btn" onClick={() => buy(item)}>
              Kup
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
