import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InviteType } from "@nova/shared";
import { InviteEntity } from "../database/entities/invite.entity";
import { UsersService } from "../users/users.service";

@Injectable()
export class InvitesService {
  constructor(@InjectRepository(InviteEntity) private invites: Repository<InviteEntity>, private users: UsersService) {}

  async send(fromUserId: string, type: InviteType, toUsername: string, targetId: string, message = ""): Promise<InviteEntity> {
    const toUser = await this.users.findByUsername(toUsername);
    return this.invites.save(this.invites.create({ type, fromUserId, toUserId: toUser.id, targetId, message }));
  }

  async listForUser(userId: string): Promise<InviteEntity[]> {
    return this.invites.find({ where: { toUserId: userId }, order: { createdAt: "DESC" } });
  }

  async dismiss(id: string, userId: string): Promise<void> {
    await this.invites.delete({ id, toUserId: userId });
  }
}
