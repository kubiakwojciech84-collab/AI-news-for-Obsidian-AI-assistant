# Cafe Simulator (prototype)

Slug: `cafe-simulator` - Genre: `simulator`

## Concept

Players run a cafe: AI "customer" bots walk in, queue at the counter, place an order, wait,
and leave a tip - all handled by `@nova/ai`'s bot behavior stack repurposed for a
non-combat, task-driven NPC crowd instead of enemies.

## What exists today

Registered in the catalog with an empty scene and `GameStatus.PROTOTYPE`.

## To make it playable

1. Build a cafe interior with a queue path and counter `trigger` node in NovaStudio.
2. Add a `SimulatorRoom extends BaseGameRoom` that spawns `BotController`s with
   `canFight: false, canCollect: false` and a custom `patrolPoints` path (queue -> counter ->
   exit), reusing `GridNavGraph` for navigation exactly like `ShooterRoom` does for combat
   bots.
3. When a customer bot reaches the counter, have the room emit a "new order" event to the
   player's client (same `ServerMessage` broadcast pattern as `CHECKPOINT`/`HIT`) and award
   coins via the backend once served.
