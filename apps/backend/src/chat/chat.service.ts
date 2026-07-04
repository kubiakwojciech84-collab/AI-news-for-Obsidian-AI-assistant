import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChatMessageEntity } from "../database/entities/chat-message.entity";

@Injectable()
export class ChatService {
  constructor(@InjectRepository(ChatMessageEntity) private messages: Repository<ChatMessageEntity>) {}

  async history(channel: string, limit = 50): Promise<ChatMessageEntity[]> {
    const rows = await this.messages.find({ where: { channel }, order: { createdAt: "DESC" }, take: limit });
    return rows.reverse();
  }

  async record(channel: string, fromUserId: string, fromUsername: string, body: string): Promise<ChatMessageEntity> {
    return this.messages.save(this.messages.create({ channel, fromUserId, fromUsername, body: body.slice(0, 500) }));
  }
}
