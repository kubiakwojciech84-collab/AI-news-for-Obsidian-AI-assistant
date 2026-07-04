/** Colyseus room names, kept as string constants so client and server never drift apart. */
export const ROOM_NAMES = {
  OBBY: "obby",
  SHOOTER: "shooter",
  SANDBOX: "sandbox",
  GENERIC: "generic",
} as const;

export type RoomName = (typeof ROOM_NAMES)[keyof typeof ROOM_NAMES];

/** Messages sent client -> server. */
export enum ClientMessage {
  MOVE_INPUT = "move_input",
  JUMP = "jump",
  FIRE = "fire",
  INTERACT = "interact",
  CHAT = "chat",
  RESPAWN = "respawn",
}

/** Messages sent server -> client. */
export enum ServerMessage {
  WELCOME = "welcome",
  CHAT = "chat",
  HIT = "hit",
  ELIMINATED = "eliminated",
  CHECKPOINT = "checkpoint",
  GAME_OVER = "game_over",
  NPC_SAY = "npc_say",
}

export interface MoveInputPayload {
  seq: number;
  x: number;
  z: number;
  yaw: number;
  dtMs: number;
}

export interface FirePayload {
  originX: number;
  originY: number;
  originZ: number;
  dirX: number;
  dirY: number;
  dirZ: number;
}
