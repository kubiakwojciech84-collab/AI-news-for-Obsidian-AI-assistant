# Games catalog

This directory holds the source for every game shipped in the NovaWorlds catalog.

| Game | Slug | Status | Package |
|---|---|---|---|
| Obby - Tower of Trials | `obby` | **Playable** | [`games/obby`](./obby) (`@nova/game-obby`) |
| Shooter FPS Arena | `shooter-fps` | **Playable** | [`games/shooter-fps`](./shooter-fps) (`@nova/game-shooter-fps`) |
| Survival Island | `survival-island` | Prototype | [`games/survival`](./survival) |
| Tower Tycoon | `tower-tycoon` | Prototype | [`games/tycoon`](./tycoon) |
| Hide and Seek | `hide-and-seek` | Prototype | [`games/hide-and-seek`](./hide-and-seek) |
| Speed Racing | `speed-racing` | Prototype | [`games/racing`](./racing) |
| Sandbox World | `sandbox-world` | Prototype | [`games/sandbox`](./sandbox) |
| Fantasy RPG | `fantasy-rpg` | Prototype | [`games/rpg`](./rpg) |
| Cafe Simulator | `cafe-simulator` | Prototype | [`games/simulator`](./simulator) |

## Playable vs. prototype

- **Playable** games ship a real, procedurally-authored level (see `src/index.ts` in each
  package), are wired into `apps/game-server` with a dedicated Colyseus `Room` subclass
  (`ObbyRoom`, `ShooterRoom`), and are fully multiplayer with working win conditions,
  scoring and (for Shooter) AI combat bots.
- **Prototype** games are registered in the database catalog (`apps/backend/src/seed/seed.service.ts`)
  with an empty scene and `GameStatus.PROTOTYPE`, so they already appear on the homepage /
  games list with an honest "prototype" badge instead of a broken "play" button. Each has a
  README here describing the intended mechanics and the concrete steps to bring it to
  "playable": build the level in NovaStudio (`apps/editor`), publish it, then add a matching
  `Room` subclass in `apps/game-server/src/rooms` (most of the plumbing - auth, physics,
  chat, bots - is already shared via `BaseGameRoom`).

See the root `ROADMAP.md` for the prioritized order in which these are intended to be
finished.
