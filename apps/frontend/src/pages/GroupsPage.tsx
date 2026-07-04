import { FormEvent, useEffect, useState } from "react";
import type { Group } from "@nova/shared";
import { GroupsApi } from "../api/endpoints";

export function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const reload = () => {
    GroupsApi.list().then(setGroups);
  };
  useEffect(reload, []);

  const createGroup = async (e: FormEvent) => {
    e.preventDefault();
    await GroupsApi.create(name, description);
    setName("");
    setDescription("");
    reload();
  };

  return (
    <main className="page">
      <h1>Grupy</h1>
      <form className="stack" onSubmit={createGroup} style={{ marginBottom: "1.5rem" }}>
        <input placeholder="Nazwa grupy" value={name} onChange={(e) => setName(e.target.value)} required />
        <textarea placeholder="Opis" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <button className="btn" type="submit">
          Utworz grupe
        </button>
      </form>

      <div className="grid cols-3">
        {groups.map((g) => (
          <div className="card" key={g.id}>
            <strong>{g.name}</strong>
            <p style={{ color: "var(--text-muted)" }}>{g.description}</p>
            <p style={{ fontSize: "0.85rem" }}>{g.memberCount} czlonkow</p>
            <button
              className="btn secondary"
              onClick={async () => {
                await GroupsApi.join(g.id);
                reload();
              }}
            >
              Dolacz
            </button>
          </div>
        ))}
        {groups.length === 0 && <p style={{ color: "var(--text-muted)" }}>Brak grup - zaloz pierwsza!</p>}
      </div>
    </main>
  );
}
