import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ChatService } from "./chat.service";

@ApiTags("chat")
@Controller("chat")
export class ChatController {
  constructor(private chat: ChatService) {}

  @Get("history")
  history(@Query("channel") channel: string) {
    return this.chat.history(channel || "global");
  }
}
