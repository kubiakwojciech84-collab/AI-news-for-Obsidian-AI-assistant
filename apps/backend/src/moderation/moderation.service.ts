import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ReportEntity, ReportStatus, ReportTargetType } from "../database/entities/report.entity";
import { UserEntity } from "../database/entities/user.entity";

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(ReportEntity) private reports: Repository<ReportEntity>,
    @InjectRepository(UserEntity) private users: Repository<UserEntity>
  ) {}

  async fileReport(reporterId: string, targetType: ReportTargetType, targetId: string, reason: string): Promise<ReportEntity> {
    return this.reports.save(this.reports.create({ reporterId, targetType, targetId, reason }));
  }

  listOpen(): Promise<ReportEntity[]> {
    return this.reports.find({ where: { status: ReportStatus.OPEN }, order: { createdAt: "ASC" } });
  }

  listAll(): Promise<ReportEntity[]> {
    return this.reports.find({ order: { createdAt: "DESC" } });
  }

  async resolve(reportId: string, moderatorId: string, status: ReportStatus.RESOLVED | ReportStatus.DISMISSED, note = ""): Promise<ReportEntity> {
    const report = await this.reports.findOne({ where: { id: reportId } });
    if (!report) throw new NotFoundException("Report not found");
    report.status = status;
    report.resolvedByUserId = moderatorId;
    report.resolutionNote = note;
    return this.reports.save(report);
  }

  async banUser(userId: string, reason: string): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    user.banned = true;
    user.banReason = reason || "Banned by moderator";
    return this.users.save(user);
  }
}
