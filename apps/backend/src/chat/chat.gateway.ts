import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";

interface AuthedSocket extends Socket {
  data: { userId: string; username: string };
}

/**
 * Realtime global/friend chat, independent from the per-game Colyseus rooms
 * (which have their own low-latency chat channel for in-game messages).
 */
@WebSocketGateway({ namespace: "/chat", cors: { origin: "*" } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private logger = new Logger(ChatGateway.name);

  constructor(private jwt: JwtService, private chat: ChatService) {}

  handleConnection(socket: AuthedSocket): void {
    try {
      const token = (socket.handshake.auth?.token as string) ?? (socket.handshake.query.token as string);
      const payload = this.jwt.verify(token);
      socket.data = { userId: payload.sub, username: payload.username };
      socket.join("global");
    } catch {
      this.logger.warn(`Rejected unauthenticated chat socket ${socket.id}`);
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: AuthedSocket): void {
    this.logger.debug(`Chat socket disconnected: ${socket.id} (${socket.data?.username})`);
  }

  @SubscribeMessage("join_channel")
  async onJoinChannel(@ConnectedSocket() socket: AuthedSocket, @MessageBody() channel: string): Promise<void> {
    await socket.join(channel);
    const history = await this.chat.history(channel);
    socket.emit("history", history);
  }

  @SubscribeMessage("send_message")
  async onSendMessage(
    @ConnectedSocket() socket: AuthedSocket,
    @MessageBody() payload: { channel: string; body: string }
  ): Promise<void> {
    const message = await this.chat.record(payload.channel, socket.data.userId, socket.data.username, payload.body);
    this.server.to(payload.channel).emit("message", message);
  }
}
