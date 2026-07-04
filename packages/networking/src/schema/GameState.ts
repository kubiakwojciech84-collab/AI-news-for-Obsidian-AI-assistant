import { Schema, MapSchema, type } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("string") userId = "";
  @type("string") username = "displayName";
  @type("number") x = 0;
  @type("number") y = 0;
  @type("number") z = 0;
  @type("number") yaw = 0;
  @type("number") health = 100;
  @type("boolean") isBot = false;
  @type("number") score = 0;
  @type("number") lastCheckpoint = 0;
  @type("boolean") eliminated = false;
}

export class ProjectileState extends Schema {
  @type("string") id = "";
  @type("string") ownerId = "";
  @type("number") x = 0;
  @type("number") y = 0;
  @type("number") z = 0;
  @type("number") dirX = 0;
  @type("number") dirY = 0;
  @type("number") dirZ = 0;
  @type("number") spawnedAt = 0;
}

export class GameRoomState extends Schema {
  @type("string") gameId = "";
  @type("string") phase: "waiting" | "playing" | "ended" = "waiting";
  @type("number") timeRemaining = 0;
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type({ map: ProjectileState }) projectiles = new MapSchema<ProjectileState>();
}
