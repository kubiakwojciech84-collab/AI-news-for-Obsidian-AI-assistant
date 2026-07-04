import { Client, Room } from "colyseus.js";
import type { GameRoomState } from "../schema/GameState";
import type { RoomName } from "@nova/shared";

export interface JoinOptions {
  userId: string;
  username: string;
  accessToken: string;
  gameId: string;
}

/** Thin wrapper so React components don't touch the colyseus.js client directly. */
export class GameClient {
  private client: Client;

  constructor(endpoint: string) {
    this.client = new Client(endpoint);
  }

  async join(roomName: RoomName, options: JoinOptions): Promise<Room<GameRoomState>> {
    return this.client.joinOrCreate<GameRoomState>(roomName, options as unknown as Record<string, unknown>);
  }

  async reconnect(reconnectionToken: string): Promise<Room<GameRoomState>> {
    return this.client.reconnect<GameRoomState>(reconnectionToken);
  }
}
