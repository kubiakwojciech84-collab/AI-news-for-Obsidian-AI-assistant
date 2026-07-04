# NovaWorlds

Otwarta, samodzielnie hostowalna platforma do tworzenia i grania w multiplayerowe gry 3D
wprost w przegladarce - w duchu Roblox: konta, katalog gier, wlasny silnik 3D, multiplayer,
edytor map/skryptow (NovaStudio), boty AI, NPC z prawdziwym dialogiem LLM, ekonomia, sklep,
osiagniecia, rankingi oraz panele administracyjne.

Zobacz [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) po uzasadnienie wyboru technologii i
opis architektury, oraz [`docs/ROADMAP.md`](./docs/ROADMAP.md) po uczciwy opis tego, co dziala
w pelni, a co jest swiadomym uproszczeniem do dalszej rozbudowy.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Three.js
- **Backend API**: NestJS + PostgreSQL (TypeORM) + JWT
- **Multiplayer**: Colyseus (autorytatywny serwer gry)
- **Fizyka**: cannon-es (dziala identycznie na serwerze i w przegladarce)
- **AI**: wlasny pakiet botow (A*, maszyna stanow) + Anthropic Claude dla dialogow NPC
- **Edytor**: NovaStudio (React + Three.js), osobna aplikacja w stylu Roblox Studio
- **Launcher**: Electron (natywny shell wokol web-clienta)
- **Konteneryzacja**: Docker + docker-compose

## Wymagania

- Node.js 20+
- npm 10+
- Docker + Docker Compose (opcjonalnie, ale najlatwiejsza sciezka uruchomienia)
- Klucz Anthropic API (**opcjonalny** - bez niego NPC dzialaja w trybie offline z odpowiedziami regulowymi)

## Najszybszy start - Docker Compose (cala platforma jedna komenda)

```bash
docker compose up --build
```

Po zbudowaniu obrazow dostepne beda:

| Usluga | Adres |
|---|---|
| Strona glowna (frontend) | http://localhost:5173 |
| NovaStudio (edytor) | http://localhost:5174 |
| Backend API | http://localhost:4000/api |
| Dokumentacja API (Swagger) | http://localhost:4000/api/docs |
| Serwer gry (Colyseus) | ws://localhost:2567 (podglad: http://localhost:2567/monitor) |
| PostgreSQL | localhost:5432 (user/pass/db: `nova`/`nova`/`nova_worlds`) |

Baza danych zostanie automatycznie obsadzona przy pierwszym starcie backendu (patrz
`apps/backend/src/seed/seed.service.ts`): konto administratora, moderatora, katalog 9 gier,
sklep, osiagniecia oraz przykladowy NPC z questem.

**Domyslne konta demo:**

| Login | Haslo | Rola |
|---|---|---|
| `admin` | `Admin123!` | Administrator |
| `moderator` | `Moderator123!` | Moderator |

Aby wlaczyc prawdziwe (nie regulowe) rozmowy z NPC, ustaw zmienna srodowiskowa przed
uruchomieniem: `ANTHROPIC_API_KEY=sk-ant-... docker compose up --build`.

## Uruchomienie lokalne bez Dockera (do dalszego rozwoju)

1. Zainstaluj zaleznosci calego monorepo (npm workspaces):

   ```bash
   npm install
   ```

2. Uruchom PostgreSQL (np. przez Docker, tylko baze danych):

   ```bash
   docker run -d --name nova-postgres -e POSTGRES_USER=nova -e POSTGRES_PASSWORD=nova \
     -e POSTGRES_DB=nova_worlds -p 5432:5432 postgres:16-alpine
   ```

3. Skopiuj pliki `.env.example` -> `.env` w kazdej aplikacji i dostosuj w razie potrzeby:

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/game-server/.env.example apps/game-server/.env
   cp apps/frontend/.env.example apps/frontend/.env
   cp apps/editor/.env.example apps/editor/.env
   ```

   > Wazne: `JWT_SECRET` i `INTERNAL_API_KEY` musza byc **identyczne** w `apps/backend/.env`
   > i `apps/game-server/.env` - backend i serwer gry weryfikuja ten sam token.

4. Uruchom wszystkie aplikacje rownolegle:

   ```bash
   npm run dev
   ```

   Albo pojedynczo, w osobnych terminalach:

   ```bash
   npm run dev:backend       # NestJS API na :4000
   npm run dev:game-server   # Colyseus na :2567
   npm run dev:frontend      # React na :5173
   npm run dev:editor        # NovaStudio na :5174
   ```

5. (Opcjonalnie) uruchom natywny launcher desktopowy, gdy frontend juz dziala na :5173:

   ```bash
   cd apps/launcher && npm install && npm start
   ```

## Granie i tworzenie gier

1. Zaloz konto (lub zaloguj sie kontem demo) na http://localhost:5173.
2. Wejdz w **Gry** - zagraj w **Obby** lub **Shooter FPS Arena** (jedyne w pelni grywalne "z
   pudelka" - pozostale 7 gier to prototypy z katalogu, kazda z wlasnym planem dokonczenia w
   `games/<nazwa>/README.md`).
3. Aby stworzyc/edytowac wlasna gre: otworz **NovaStudio** (http://localhost:5174), zaloguj
   sie tym samym kontem, utworz projekt, buduj mape (prymitywy, import modeli GLTF, skrypty),
   przetestuj lokalnie przyciskiem "Testuj gre", a nastepnie **Publikuj** - gra od razu
   pojawi sie jako grywalna w katalogu.

## Struktura projektu

```
apps/backend       - NestJS + PostgreSQL: REST API (konta, gry, spolecznosc, ekonomia, moderacja, NPC/AI)
apps/frontend      - React + Three.js: strona glowna, granie w gry, spolecznosc, sklep, panele
apps/game-server   - Colyseus: multiplayer, fizyka (cannon-es), boty AI
apps/editor        - NovaStudio: edytor map/skryptow w stylu Roblox Studio
apps/launcher      - Electron: natywny launcher desktopowy
packages/shared    - wspoldzielone typy TypeScript / DTO / stale
packages/engine3d  - silnik 3D (Three.js): budowa sceny z JSON, kamery, kontroler postaci, skrypty
packages/physics   - swiat fizyki (cannon-es), wspoldzielony serwer/klient
packages/networking- schematy stanu Colyseus + klient
packages/ai        - boty (pathfinding A*, maszyna stanow) + NPC (dialog LLM + pamiec)
games/*            - definicje/poziomy poszczegolnych gier katalogu
docs/              - architektura, API, roadmapa
```

Pelna lista plikow repozytorium: [`docs/FILES.md`](./docs/FILES.md).

## Dokumentacja

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) - stack, uzasadnienie wyboru technologii, architektura, przeplyw danych
- [`docs/API.md`](./docs/API.md) - skrot API + link do Swagger
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) - co dziala w pelni, co jest uproszczone, co dalej
- [`games/README.md`](./games/README.md) - status kazdej z 9 gier katalogu
