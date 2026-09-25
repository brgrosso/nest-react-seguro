import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { Role } from "../generated/prisma/client";
import type { Request } from "express";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard, type AuthUser } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UsersService } from "./users.service";

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  me(@Req() req: Request & { user: AuthUser }) {
    return req.user;
  }

  @Roles(Role.ADMIN)
  @Get("users")
  usersList() {
    return this.users.findAll();
  }
}
