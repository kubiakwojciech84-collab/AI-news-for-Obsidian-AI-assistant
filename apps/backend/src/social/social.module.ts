import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FriendRequestEntity } from "../database/entities/friend-request.entity";
import { FriendshipEntity } from "../database/entities/friendship.entity";
import { GroupEntity } from "../database/entities/group.entity";
import { GroupMembershipEntity } from "../database/entities/group-membership.entity";
import { InviteEntity } from "../database/entities/invite.entity";
import { UsersModule } from "../users/users.module";
import { FriendsService } from "./friends.service";
import { FriendsController } from "./friends.controller";
import { GroupsService } from "./groups.service";
import { GroupsController } from "./groups.controller";
import { InvitesService } from "./invites.service";
import { InvitesController } from "./invites.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendRequestEntity, FriendshipEntity, GroupEntity, GroupMembershipEntity, InviteEntity]),
    UsersModule,
  ],
  providers: [FriendsService, GroupsService, InvitesService],
  controllers: [FriendsController, GroupsController, InvitesController],
})
export class SocialModule {}
