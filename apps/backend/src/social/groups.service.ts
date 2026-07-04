import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GroupRole } from "@nova/shared";
import { GroupEntity } from "../database/entities/group.entity";
import { GroupMembershipEntity } from "../database/entities/group-membership.entity";
import { CreateGroupDto } from "./dto/social.dto";

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupEntity) private groups: Repository<GroupEntity>,
    @InjectRepository(GroupMembershipEntity) private memberships: Repository<GroupMembershipEntity>
  ) {}

  async create(ownerId: string, dto: CreateGroupDto): Promise<GroupEntity> {
    const group = await this.groups.save(this.groups.create({ ownerId, name: dto.name, description: dto.description ?? "" }));
    await this.memberships.save(this.memberships.create({ groupId: group.id, userId: ownerId, role: GroupRole.OWNER }));
    return group;
  }

  async list(): Promise<GroupEntity[]> {
    return this.groups.find({ order: { createdAt: "DESC" } });
  }

  async get(id: string): Promise<GroupEntity> {
    const group = await this.groups.findOne({ where: { id } });
    if (!group) throw new NotFoundException("Group not found");
    return group;
  }

  async members(groupId: string): Promise<GroupMembershipEntity[]> {
    return this.memberships.find({ where: { groupId } });
  }

  async join(groupId: string, userId: string): Promise<GroupMembershipEntity> {
    const existing = await this.memberships.findOne({ where: { groupId, userId } });
    if (existing) return existing;
    return this.memberships.save(this.memberships.create({ groupId, userId, role: GroupRole.MEMBER }));
  }

  async leave(groupId: string, userId: string): Promise<void> {
    await this.memberships.delete({ groupId, userId });
  }

  async setRole(groupId: string, actingUserId: string, targetUserId: string, role: GroupRole): Promise<GroupMembershipEntity> {
    const acting = await this.memberships.findOne({ where: { groupId, userId: actingUserId } });
    if (!acting || (acting.role !== GroupRole.OWNER && acting.role !== GroupRole.MODERATOR)) {
      throw new ForbiddenException("Insufficient group permissions");
    }
    const target = await this.memberships.findOne({ where: { groupId, userId: targetUserId } });
    if (!target) throw new NotFoundException("Member not found");
    target.role = role;
    return this.memberships.save(target);
  }
}
