import { Controller, Get, UseGuards } from "@nestjs/common";
import { Role } from "../generated/prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { LoginAuditService } from "./login-audit.service";

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoginAuditController {
  constructor(private readonly loginAudit: LoginAuditService) {}

  @Roles(Role.ADMIN)
  @Get("audit")
  auditLog() {
    return this.loginAudit.list();
  }
}
