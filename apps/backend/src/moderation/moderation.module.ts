import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReportEntity } from "../database/entities/report.entity";
import { UserEntity } from "../database/entities/user.entity";
import { ModerationService } from "./moderation.service";
import { ModerationController } from "./moderation.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity, UserEntity])],
  providers: [ModerationService],
  controllers: [ModerationController],
})
export class ModerationModule {}
