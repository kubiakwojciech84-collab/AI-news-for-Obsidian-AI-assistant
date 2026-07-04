import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatMessageEntity } from "../database/entities/chat-message.entity";
import { AuthModule } from "../auth/auth.module";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessageEntity]), AuthModule],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
