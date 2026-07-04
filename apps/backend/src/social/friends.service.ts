import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FriendRequestStatus } from "@nova/shared";
import { FriendRequestEntity } from "../database/entities/friend-request.entity";
import { FriendshipEntity } from "../database/entities/friendship.entity";
import { UsersService } from "../users/users.service";

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendRequestEntity) private requests: Repository<FriendRequestEntity>,
    @InjectRepository(FriendshipEntity) private friendships: Repository<FriendshipEntity>,
    private users: UsersService
  ) {}

  async sendRequest(fromUserId: string, toUsername: string): Promise<FriendRequestEntity> {
    const toUser = await this.users.findByUsername(toUsername);
    if (toUser.id === fromUserId) throw new BadRequestException("Cannot friend yourself");

    const existing = await this.requests.findOne({
      where: [
        { fromUserId, toUserId: toUser.id, status: FriendRequestStatus.PENDING },
        { fromUserId: toUser.id, toUserId: fromUserId, status: FriendRequestStatus.PENDING },
      ],
    });
    if (existing) throw new ConflictException("A pending friend request already exists");

    return this.requests.save(this.requests.create({ fromUserId, toUserId: toUser.id, status: FriendRequestStatus.PENDING }));
  }

  async respond(requestId: string, userId: string, accept: boolean): Promise<void> {
    const request = await this.requests.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException("Friend request not found");
    if (request.toUserId !== userId) throw new BadRequestException("Not your request to answer");

    request.status = accept ? FriendRequestStatus.ACCEPTED : FriendRequestStatus.DECLINED;
    await this.requests.save(request);

    if (accept) {
      const now = new Date();
      await this.friendships.save([
        this.friendships.create({ userId: request.fromUserId, friendId: request.toUserId, since: now }),
        this.friendships.create({ userId: request.toUserId, friendId: request.fromUserId, since: now }),
      ]);
    }
  }

  async listIncoming(userId: string): Promise<FriendRequestEntity[]> {
    return this.requests.find({ where: { toUserId: userId, status: FriendRequestStatus.PENDING } });
  }

  async listFriends(userId: string): Promise<FriendshipEntity[]> {
    return this.friendships.find({ where: { userId } });
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await this.friendships.delete({ userId, friendId });
    await this.friendships.delete({ userId: friendId, friendId: userId });
  }
}
