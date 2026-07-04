# API

Pelna, interaktywna, zawsze aktualna dokumentacja REST API jest generowana automatycznie
przez NestJS + `@nestjs/swagger` bezposrednio z kodu (kontrolerow i DTO), wiec nigdy nie
rozjedzie sie z rzeczywista implementacja. Po uruchomieniu backendu dostepna jest pod:

```
http://localhost:4000/api/docs
```

## Skrot glownych zasobow

| Zasob | Bazowa sciezka | Opis |
|---|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` | Rejestracja/logowanie, zwraca JWT |
| Users | `/api/users/*` | Profil wlasny i publiczny, wyszukiwanie |
| Games | `/api/games/*` | Katalog gier, tworzenie, publikowanie sceny, licznik rozgrywek |
| Social | `/api/friends/*`, `/api/groups/*`, `/api/invites/*` | Znajomi, grupy, zaproszenia |
| Economy | `/api/shop/*`, `/api/inventory/*` | Sklep i ekwipunek |
| Progression | `/api/achievements/*`, `/api/leaderboard/*` | Osiagniecia i rankingi |
| Chat | `/api/chat/history`, WebSocket `/chat` | Historia + czat na zywo (Socket.IO) |
| NPC / AI | `/api/npc/*` | Rozmowa z NPC (LLM) i postep questow |
| Moderation | `/api/moderation/*` | Zglosznia, banowanie (moderator/admin) |
| Admin | `/api/admin/*` | Zarzadzanie kontami, rolami, grami (admin) |
| Uploads | `POST /api/uploads` | Upload assetow (modele GLTF, obrazki) |

Wiekszosc endpointow wymaga naglowka `Authorization: Bearer <JWT>` zdobytego z
`/api/auth/login`. Endpointy wywolywane przez `apps/game-server` (np. zapis wyniku,
odblokowanie osiagniecia) uzywaja zamiast tego naglowka `x-internal-api-key` z tym samym
sekretem co `INTERNAL_API_KEY` w `.env` backendu.

## Multiplayer (poza REST)

`apps/game-server` (Colyseus) nie jest czescia tego REST API - klienci laczy sie z nim
bezposrednio przez WebSocket na porcie `2567`, uzywajac JWT wydanego przez `/api/auth/login`
jako `accessToken` w opcjach dolaczenia do pokoju (`GameClient.join` z `@nova/networking`).
