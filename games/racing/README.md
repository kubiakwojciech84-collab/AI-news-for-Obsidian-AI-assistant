# Speed Racing (prototype)

Slug: `speed-racing` - Genre: `racing`

## Concept

Players race a lap-based track, passing through ordered `checkpoint` nodes (the same scene
node type and server-side detection `ObbyRoom` already uses); best lap time is submitted to
the game's leaderboard.

## What exists today

Registered in the catalog with an empty scene and `GameStatus.PROTOTYPE`. The checkpoint
detection and scoring pipeline this game needs is already implemented and battle-tested in
`ObbyRoom` (`apps/game-server/src/rooms/ObbyRoom.ts`) - racing only needs a vehicle
controller instead of a jumping character controller.

## To make it playable

1. Build a track out of `box`/`plane` road segments with sequential `checkpoint` nodes in
   NovaStudio.
2. Add a `RacingRoom extends BaseGameRoom` that swaps the on-foot `CharacterBody` movement
   for a simple vehicle model (accelerate/steer/brake) built on `@nova/physics`'s
   `PhysicsWorld`, reusing `ObbyRoom`'s checkpoint-crossing detection almost verbatim, but
   looping back to checkpoint 0 for additional laps instead of finishing at the top.
3. Submit each completed lap's time via `reportScore` (lower time = higher score, same
   convention as Obby).
