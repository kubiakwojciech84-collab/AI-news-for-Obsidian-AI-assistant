# Tower Tycoon (prototype)

Slug: `tower-tycoon` - Genre: `tycoon`

## Concept

Players buy machines/rooms that passively generate coins over time, reinvest to unlock
bigger multipliers, and compete on a per-game leaderboard for total coins earned.

## What exists today

Registered in the catalog with an empty scene and `GameStatus.PROTOTYPE`. The economy
primitives it needs (coins, `ShopItem`, `InventoryEntryEntity`) already exist backend-side.

## To make it playable

1. Author the tycoon plot (a grid of buildable slots) in NovaStudio; mark buildable slots as
   `trigger` nodes with `metadata.slotId`.
2. Add a `TycoonRoom extends BaseGameRoom` that, on a fixed interval, credits each player's
   purchased generators via the backend's `UsersService.addCoins` (through a new internal
   endpoint, following the same pattern as `achievements/unlock`).
3. Reuse `LeaderboardApi` (`/leaderboard/game/:gameId`) to rank players by total coins earned
   in that tycoon session.
