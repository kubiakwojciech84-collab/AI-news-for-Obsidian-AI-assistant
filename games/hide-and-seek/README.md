# Hide and Seek (prototype)

Slug: `hide-and-seek` - Genre: `hide_and_seek`

## Concept

One randomly-chosen player is "it" and must find everyone else before a timer runs out;
everyone else hides around the map. AI bots can fill empty hider slots using the existing
`BotBrain` `PATROL` state (wandering between patrol points looks convincingly like a hiding
bot occasionally repositioning).

## What exists today

Registered in the catalog with an empty scene and `GameStatus.PROTOTYPE`.

## To make it playable

1. Build a map with lots of hiding spots and multiple `spawn` nodes in NovaStudio.
2. Add a `HideAndSeekRoom extends BaseGameRoom` that:
   - Picks one connected player as seeker on room start (`state.phase` transition).
   - Blinds the seeker's client (hide other players' meshes) until a "seek phase" begins.
   - Uses proximity checks each tick (same pattern as `ObbyRoom`'s checkpoint detection) to
     detect the seeker touching a hider, eliminating them.
3. Report the winning seeker/last-hider-standing score via `reportScore`.
