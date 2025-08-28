import { Module } from "@nestjs/common";
import { AuditController } from "./audit.controller";
import { AuditService } from "./audit.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";

@Module({
  controllers: [AuditController],
  providers: [AuditService, PrismaService, ExceptionService],
})
export class AuditModule {}
