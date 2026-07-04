# Architektura NovaWorlds

## Stack technologiczny i uzasadnienie wyboru

| Warstwa | Technologia | Uzasadnienie |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Szybki dev-server, ogromny ekosystem, TS daje bezpieczenstwo typow na granicy z backendem dzieki wspoldzielonemu pakietowi `@nova/shared`. |
| Render 3D | Three.js | Najbardziej dojrzala biblioteka WebGL z ogromna spolecznoscia, natywne wsparcie dla GLTF (import modeli), dziala identycznie w edytorze i w graczu gry. |
| Backend API | NestJS + TypeORM + PostgreSQL | NestJS daje modularna architekture (moduly/serwisy/kontrolery) blisk Angularowi, wbudowany DI, guardy, Swagger - idealne dla duzego, wieloosobowego API. PostgreSQL ze wzgledu na relacyjne dane (konta, spolecznosc, ekonomia) + wsparcie JSONB dla scen gier. |
| Multiplayer | Colyseus | Framework zaprojektowany specjalnie do gier multiplayer: synchronizacja stanu przez `@colyseus/schema` (delta-compression "z pudelka"), pokoje (rooms) jako naturalny odpowiednik serwera danej rozgrywki, dużo prostszy do wdrozenia niz reczne zarzadzanie surowymi WebSocketami przy zachowaniu pelnej kontroli (w odroznieniu od czesciowo czarnoskrzynkowych silnikow typu Photon). |
| Fizyka | cannon-es | Czysty TypeScript/JavaScript (bez WASM), dziala identycznie na serwerze (Node, headless) i w przegladarce, wystarczajaco wydajny dla postaci/przeszkod w grach casualowych. Rapier (WASM) dawalby wieksza wydajnosc, ale kosztem trudniejszego debugowania i zaleznosci od ladowania WASM w kazdym srodowisku (w tym w Node) - w tym projekcie priorytetem byla prostota uruchomienia. |
| Logowanie | JWT (access token) | Bezstanowe uwierzytelnianie, jeden token wspoldzielony przez REST API i (poprzez ten sam sekret) przez serwer gry przy `onAuth` w Colyseus. |
| Przechowywanie plikow | Lokalny dysk (multer) | Endpoint `POST /api/uploads` zapisuje pliki na dysku i zwraca URL; silnik przechowywania jest wymienny (patrz `apps/backend/src/uploads/uploads.controller.ts`) - podmiana na `multer-s3` przenosi na S3 bez zmian w wywolujacych. |
| AI (boty) | Wlasny pakiet `@nova/ai` | Maszyna stanow (patrol/chase/attack/collect/flee) + A* po siatce + unikanie przeszkod - w pelni deterministyczne i tanie obliczeniowo, uruchamiane 30x/s na serwerze gry dla kazdego bota. |
| AI (NPC/dialog) | Anthropic Claude (`claude-sonnet-5`) | Prawdziwe, naturalne rozmowy z NPC z pamiecia per-gracz w bazie danych; dziala w pelni offline (bez klucza API) dzieki wbudowanemu trybowi awaryjnemu z odpowiedziami regulowymi. |
| Konteneryzacja | Docker + docker-compose | Jedna komenda uruchamia cala platforme (baza, backend, game-server, frontend, edytor) identycznie u kazdego dewelopera i na serwerze produkcyjnym. |

## Struktura repozytorium

```
apps/
  frontend/     - React + Three.js: strona glowna, konta, granie w gry, spolecznosc, sklep, panele
  backend/      - NestJS + PostgreSQL: REST API dla calej platformy
  game-server/  - Colyseus: autorytatywny serwer multiplayer, fizyka, boty AI
  editor/       - NovaStudio: edytor map/skryptow w stylu Roblox Studio
  launcher/     - Electron: natywny launcher desktopowy spinajacy web-client
packages/
  shared/       - wspoldzielone typy TS, DTO, stale (kontrakt frontend <-> backend <-> game-server)
  engine3d/     - silnik 3D oparty o Three.js (scena z JSON, kontrolery kamery/postaci, skrypty)
  physics/      - cannon-es (swiat fizyki, cialo postaci, budowanie kolizji ze sceny)
  networking/   - schematy stanu Colyseus + klient
  ai/           - pathfinding A*, steering, maszyna stanow botow, dialog NPC (LLM)
games/
  obby/, shooter-fps/  - w pelni grywalne definicje poziomow (generowane programowo)
  survival/, tycoon/, hide-and-seek/, racing/, sandbox/, rpg/, simulator/ - prototypy + plan rozbudowy
docs/
  ARCHITECTURE.md, API.md, ROADMAP.md
```

## Przeplyw danych w rozgrywce

1. Gracz otwiera `/games/:slug` we frontendzie -> pobiera metadane gry z `GET /api/games/:slug` (backend, Postgres).
2. Jesli gra ma status `playable`, frontend laczy sie przez WebSocket z `apps/game-server` (Colyseus), podajac JWT wydany przez backend.
3. `game-server` weryfikuje JWT tym samym sekretem co backend (`onAuth`), pobiera opublikowana scene gry z backendu (`GET /api/games/:slug`), buduje z niej swiat fizyki (`@nova/physics`) i siatke nawigacji dla botow (`@nova/ai`).
4. Kazda klatka: gracze wysylaja input ruchu, serwer symuluje fizyke i AI botow, i synchronizuje stan (`GameRoomState`) do wszystkich klientow przez Colyseus.
5. Zdarzenia takie jak ukonczenie gry, zabojstwo, checkpoint wywoluja wywolania serwer-serwer do backendu (`x-internal-api-key`) w celu zapisania wyniku w rankingu i odblokowania osiagniec.

## Edytor (NovaStudio)

Edytor operuje na tym samym formacie JSON sceny (`GameScene`/`SceneNode` z `@nova/shared`), ktory:
- renderuje `@nova/engine3d`'s `buildScene()` (uzywane zarowno w edytorze, jak i w graczu gry),
- zamienia sie na fizyczne bryly przez `@nova/physics`'s `createBodyFromNode()` (uzywane zarowno w trybie "testuj gre" w edytorze, jak i autorytatywnie na `game-server`).

Dzieki temu poziom zbudowany w edytorze dziala identycznie w podgladzie testowym i w opublikowanej, wieloosobowej rozgrywce - nie ma osobnej "wersji produkcyjnej" formatu poziomu.
