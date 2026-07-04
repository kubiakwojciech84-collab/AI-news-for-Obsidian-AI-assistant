import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UserRole } from "@nova/shared";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { ModerationService } from "./moderation.service";
import { ReportStatus, ReportTargetType } from "../database/entities/report.entity";

class FileReportDto {
  @IsEnum(ReportTargetType) targetType!: ReportTargetType;
  @IsNotEmpty() targetId!: string;
  @IsNotEmpty() @IsString() reason!: string;
}

class ResolveReportDto {
  @IsEnum(ReportStatus) status!: ReportStatus.RESOLVED | ReportStatus.DISMISSED;
  @IsOptional() @IsString() note?: string;
}

class BanUserDto {
  @IsOptional() @IsString() reason?: string;
}

@ApiTags("moderation")
@Controller("moderation")
export class ModerationController {
  constructor(private moderation: ModerationService) {}

  @Post("reports")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  fileReport(@CurrentUser() user: RequestUser, @Body() dto: FileReportDto) {
    return this.moderation.fileReport(user.userId, dto.targetType, dto.targetId, dto.reason);
  }

  @Get("reports")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  listOpen() {
    return this.moderation.listOpen();
  }

  @Get("reports/all")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  listAll() {
    return this.moderation.listAll();
  }

  @Post("reports/:id/resolve")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  resolve(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: ResolveReportDto) {
    return this.moderation.resolve(id, user.userId, dto.status, dto.note);
  }

  @Post("users/:id/ban")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  banUser(@Param("id") id: string, @Body() dto: BanUserDto) {
    return this.moderation.banUser(id, dto.reason ?? "");
  }
}
