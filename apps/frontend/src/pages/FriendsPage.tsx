import { FormEvent, useEffect, useState } from "react";
import type { FriendRequest, Friendship } from "@nova/shared";
import { FriendsApi } from "../api/endpoints";

export function FriendsPage() {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const reload = () => {
    FriendsApi.list().then(setFriends);
    FriendsApi.incoming().then(setIncoming);
  };

  useEffect(reload, []);

  const sendRequest = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await FriendsApi.send(username);
      setMessage(`Wyslano zaproszenie do ${username}`);
      setUsername("");
    } catch (err: any) {
      setMessage(err?.response?.data?.message ?? "Nie udalo sie wyslac zaproszenia");
    }
  };

  return (
    <main className="page">
      <h1>Znajomi</h1>
      <form className="stack" onSubmit={sendRequest} style={{ marginBottom: "1.5rem" }}>
        <input placeholder="Nazwa uzytkownika" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <button className="btn" type="submit">
          Wyslij zaproszenie
        </button>
        {message && <span style={{ color: "var(--text-muted)" }}>{message}</span>}
      </form>

      <h2>Oczekujace zaproszenia</h2>
      <div className="grid cols-3">
        {incoming.map((req) => (
          <div className="card" key={req.id}>
            <p>Zaproszenie od uzytkownika</p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn"
                onClick={async () => {
                  await FriendsApi.respond(req.id, true);
                  reload();
                }}
              >
                Akceptuj
              </button>
              <button
                className="btn secondary"
                onClick={async () => {
                  await FriendsApi.respond(req.id, false);
                  reload();
                }}
              >
                Odrzuc
              </button>
            </div>
          </div>
        ))}
        {incoming.length === 0 && <p style={{ color: "var(--text-muted)" }}>Brak oczekujacych zaproszen.</p>}
      </div>

      <h2 style={{ marginTop: "1.5rem" }}>Twoi znajomi</h2>
      <div className="grid cols-3">
        {friends.map((f) => (
          <div className="card" key={f.friendId}>
            <p>{f.friendId}</p>
            <button
              className="btn danger"
              onClick={async () => {
                await FriendsApi.remove(f.friendId);
                reload();
              }}
            >
              Usun
            </button>
          </div>
        ))}
        {friends.length === 0 && <p style={{ color: "var(--text-muted)" }}>Nie masz jeszcze znajomych.</p>}
      </div>
    </main>
  );
}
