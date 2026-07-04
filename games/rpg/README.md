# Fantasy RPG (prototype)

Slug: `fantasy-rpg` - Genre: `rpg`

## Concept

An exploration RPG with AI-driven NPCs who give quests, remember the player across
conversations, and reward coins/XP on completion.

## What exists today

This is the most complete prototype: the seed data (`apps/backend/src/seed/seed.service.ts`)
already creates a real NPC ("Stary Kowal Boris") with a full quest ("Zaginione Narzedzia":
collect 3 hammers), backed by:

- `@nova/ai`'s `NpcBrain`, which calls the Anthropic API (`claude-sonnet-5` by default) when
  `ANTHROPIC_API_KEY` is set, with a persistent per-player memory store
  (`PostgresNpcMemoryStore`) - or falls back to rule-based dialogue offline.
- `POST /api/npc/:id/talk` and `POST /api/npc/quests/:questId/objectives/:objectiveId/complete`,
  already implemented and working end-to-end.

What's still a prototype is the game's 3D world itself (empty scene) and a `RpgRoom` to place
the NPC in the world and trigger the "collect hammer" objective when a player picks up a
hammer item placed in the level.

## To make it playable

1. Build a village/dungeon scene in NovaStudio and place the seeded NPC's `spawnNodeId`.
2. Add an `RpgRoom extends BaseGameRoom` that spawns pickup items (hammers) as `trigger`
   nodes and calls the backend's quest-objective-complete endpoint when a player interacts
   with one (`handleInteract` hook already exists in `BaseGameRoom` for this).
3. Render an NPC dialogue UI in `apps/frontend`'s `GameCanvas` that calls `NpcApi.talk`.
