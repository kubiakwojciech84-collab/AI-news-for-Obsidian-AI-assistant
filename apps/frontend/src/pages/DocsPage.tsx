import { API_URL } from "../api/client";

export function DocsPage() {
  const swaggerUrl = `${API_URL.replace(/\/api$/, "")}/api/docs`;

  return (
    <main className="page">
      <h1>Dokumentacja</h1>
      <div className="card">
        <h2>API</h2>
        <p>
          Pelna interaktywna dokumentacja REST API (Swagger/OpenAPI) jest generowana automatycznie przez backend i dostepna pod adresem:{" "}
          <a href={swaggerUrl} target="_blank" rel="noreferrer">
            {swaggerUrl}
          </a>
        </p>
      </div>
      <div className="card" style={{ marginTop: "1rem" }}>
        <h2>Architektura</h2>
        <ul>
          <li>
            <strong>apps/frontend</strong> - React + TypeScript + Three.js, ta aplikacja
          </li>
          <li>
            <strong>apps/backend</strong> - NestJS + PostgreSQL, REST API (konta, gry, spolecznosc, ekonomia, moderacja, NPC AI)
          </li>
          <li>
            <strong>apps/game-server</strong> - Colyseus, autorytatywny serwer multiplayer + fizyka + boty AI
          </li>
          <li>
            <strong>apps/editor</strong> - NovaStudio, edytor map/skryptow/gier w stylu Roblox Studio
          </li>
          <li>
            <strong>apps/launcher</strong> - lekki launcher desktopowy (Electron)
          </li>
          <li>
            <strong>packages/engine3d, physics, networking, ai, shared</strong> - wspoldzielone biblioteki
          </li>
          <li>
            <strong>games/*</strong> - definicje gier (Obby, Shooter FPS w pelni grywalne; pozostale jako prototypy w katalogu)
          </li>
        </ul>
      </div>
      <div className="card" style={{ marginTop: "1rem" }}>
        <h2>Boty AI i NPC</h2>
        <p>
          Boty (pakiet <code>@nova/ai</code>) uzywaja maszyny stanow (patrol/chase/attack/collect/flee), nawigacji A* po siatce oraz
          unikania przeszkod. NPC prowadza rozmowy przez model Claude (jesli skonfigurowano <code>ANTHROPIC_API_KEY</code>) i pamietaja
          historie rozmow z kazdym graczem w bazie danych; bez klucza API dzialaja w trybie offline z odpowiedziami regulowymi.
        </p>
      </div>
    </main>
  );
}
