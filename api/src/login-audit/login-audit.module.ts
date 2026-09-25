import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { LoginAuditController } from "./login-audit.controller";
import { LoginAuditService } from "./login-audit.service";

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [LoginAuditController],
  providers: [LoginAuditService],
  exports: [LoginAuditService],
})
export class LoginAuditModule {}
