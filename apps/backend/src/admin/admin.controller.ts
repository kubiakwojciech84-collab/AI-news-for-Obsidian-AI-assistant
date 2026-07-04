import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "@nova/shared";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../common/roles.decorator";
import { AdminService } from "./admin.service";

class SetBannedDto {
  @IsBoolean() banned!: boolean;
  @IsOptional() @IsString() reason?: string;
}

class SetRoleDto {
  @IsEnum(UserRole) role!: UserRole;
}

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller("admin")
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get("stats")
  stats() {
    return this.admin.stats();
  }

  @Get("users")
  listUsers() {
    return this.admin.listUsers();
  }

  @Patch("users/:id/ban")
  setBanned(@Param("id") id: string, @Body() dto: SetBannedDto) {
    return this.admin.setBanned(id, dto.banned, dto.reason);
  }

  @Patch("users/:id/role")
  setRole(@Param("id") id: string, @Body() dto: SetRoleDto) {
    return this.admin.setRole(id, dto.role);
  }

  @Get("games")
  listAllGames() {
    return this.admin.listAllGames();
  }

  @Delete("games/:id")
  removeGame(@Param("id") id: string) {
    return this.admin.removeGame(id);
  }
}
