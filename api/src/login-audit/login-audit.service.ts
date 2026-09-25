import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import { clientIp } from "../auth/utils/request-meta.util";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LoginAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: {
    action: string;
    userId?: string | null;
    req?: Request;
    metadata?: Record<string, unknown>;
  }) {
    await this.prisma.auditLog.create({
      data: {
        action: params.action,
        userId: params.userId ?? null,
        ip: clientIp(params.req),
        userAgent: params.req?.get("user-agent")?.slice(0, 180) ?? null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  }

  list(take = 50) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: { user: { select: { email: true, role: true } } },
    });
  }
}
