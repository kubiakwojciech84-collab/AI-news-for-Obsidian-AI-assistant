# Survival Island (prototype)

Slug: `survival-island` - Genre: `survival`

## Concept

Players wash up on an island with no resources. They gather wood/stone/food scattered
around the map (`trigger` nodes with `metadata.kind`), craft a basic shelter, and must
survive a day/night cycle where AI bots (using `@nova/ai`'s `canFight` bot profile) spawn
as hostile creatures at night and attack unprepared players.

## What exists today

- Registered in the game catalog as a `GameStatus.PROTOTYPE` with an empty scene.
- Fully playable once a level + `SurvivalRoom` are built, since it reuses:
  - `BaseGameRoom` for auth, movement, chat, physics.
  - `@nova/ai` `BotBrain` with `canCollect: true, canFight: true` for hostile-at-night mobs.
  - The inventory/shop system for crafted items.

## To make it playable

1. Build an island terrain + resource nodes in NovaStudio (`apps/editor`), tagging resource
   pickups as `trigger` nodes with `metadata.kind = "wood" | "stone" | "food"`.
2. Add a `SurvivalRoom extends BaseGameRoom` in `apps/game-server/src/rooms` that tracks a
   day/night `timeRemaining` phase (already on `GameRoomState`) and spawns/despawns
   `BotController`s with the combat profile when night starts.
3. Add crafting recipes as new `ShopItem`s or a dedicated `CraftingService` in the backend.
