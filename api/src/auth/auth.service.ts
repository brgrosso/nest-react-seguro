import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Role } from "../generated/prisma/client";
import type { Response } from "express";
import { LoginAuditService } from "../login-audit/login-audit.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  hashPassword,
  hashToken,
  randomToken,
  verifyPassword,
} from "./utils/password";

const ACCESS_MS = 15 * 60 * 1000;
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_FAILED = 5;
const LOCK_MS = 15 * 60 * 1000;

type FailState = { count: number; lockedUntil: number };

@Injectable()
export class AuthService {
  private readonly failures = new Map<string, FailState>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: LoginAuditService,
  ) {}

  async register(
    email: string,
    password: string,
    req?: Parameters<LoginAuditService["record"]>[0]["req"],
  ) {
    const normalized = email.toLowerCase().trim();
    const exists = await this.prisma.user.findUnique({
      where: { email: normalized },
    });
    if (exists) {
      throw new ConflictException("No se pudo crear la cuenta");
    }

    const user = await this.prisma.user.create({
      data: {
        email: normalized,
        passwordHash: await hashPassword(password),
        role: Role.USER,
      },
    });

    await this.audit.record({
      action: "auth.register",
      userId: user.id,
      req,
      metadata: { email: user.email },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(
    email: string,
    password: string,
    res: Response,
    req?: Parameters<LoginAuditService["record"]>[0]["req"],
  ) {
    const normalized = email.toLowerCase().trim();
    this.assertNotLocked(normalized);

    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
    });
    const valid = user
      ? await verifyPassword(password, user.passwordHash)
      : false;

    if (!user || !valid) {
      this.recordFailure(normalized);
      await this.audit.record({
        action: "auth.login_failed",
        userId: user?.id,
        req,
        metadata: { email: normalized },
      });
      throw new UnauthorizedException("Credenciales inválidas");
    }

    this.failures.delete(normalized);
    await this.issueSession(user.id, user.email, user.role, res);
    await this.audit.record({
      action: "auth.login",
      userId: user.id,
      req,
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async refresh(refreshToken: string | undefined, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException("Sesión inválida");
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException("Sesión inválida");
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    await this.issueSession(
      stored.user.id,
      stored.user.email,
      stored.user.role,
      res,
    );

    return {
      id: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
    };
  }

  async logout(
    refreshToken: string | undefined,
    res: Response,
    userId?: string,
  ) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    this.clearCookies(res);
    if (userId) {
      await this.audit.record({ action: "auth.logout", userId });
    }
    return { ok: true };
  }

  private async issueSession(
    userId: string,
    email: string,
    role: Role,
    res: Response,
  ) {
    const access = await this.jwt.signAsync(
      { sub: userId, email, role },
      {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: "15m",
      },
    );
    const refresh = randomToken();
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refresh),
        expiresAt: new Date(Date.now() + REFRESH_MS),
      },
    });

    this.setCookie(res, "access_token", access, ACCESS_MS);
    this.setCookie(res, "refresh_token", refresh, REFRESH_MS);
  }

  private setCookie(
    res: Response,
    name: string,
    value: string,
    maxAge: number,
  ) {
    res.cookie(name, value, {
      httpOnly: true,
      sameSite: "lax",
      secure: this.config.get<string>("COOKIE_SECURE") === "true",
      path: "/",
      maxAge,
    });
  }

  private clearCookies(res: Response) {
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
  }

  private assertNotLocked(email: string) {
    const state = this.failures.get(email);
    if (state && state.lockedUntil > Date.now()) {
      throw new UnauthorizedException(
        "Cuenta temporalmente bloqueada. Probá más tarde.",
      );
    }
  }

  private recordFailure(email: string) {
    const current = this.failures.get(email) ?? { count: 0, lockedUntil: 0 };
    const count = current.count + 1;
    this.failures.set(email, {
      count,
      lockedUntil: count >= MAX_FAILED ? Date.now() + LOCK_MS : 0,
    });
  }
}
