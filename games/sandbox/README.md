# Sandbox World (prototype)

Slug: `sandbox-world` - Genre: `sandbox`

## Concept

A free-build multiplayer space: players place/remove primitive blocks in real time and see
each other's edits live, similar to a lightweight voxel/creative mode.

## What exists today

Registered in the catalog with an empty scene and `GameStatus.PROTOTYPE`. `ROOM_NAMES.SANDBOX`
is already reserved in `packages/shared/src/types/networking.ts` for this game.

## To make it playable

1. Add a `SandboxRoom extends BaseGameRoom` that adds a new schema collection (e.g.
   `placedBlocks: MapSchema<BlockState>`) to a sandbox-specific room state, and handle new
   `ClientMessage` values for "place block" / "remove block" (append these to
   `packages/shared/src/types/networking.ts` and `packages/networking/src/schema/GameState.ts`).
2. On the client, extend `GameCanvas` (or a sandbox-specific canvas) to raycast against the
   built scene and existing placed blocks to determine placement position, mirroring how
   `apps/editor`'s `Viewport` already does raycasting for selection.
3. Persist the built structure back to the game's `scene` via the existing `/games/:id/publish`
   endpoint so it survives server restarts.
