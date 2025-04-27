import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ArgonService } from "src/services/argon/argon.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, ExceptionService, PrismaService, ArgonService],
})
export class AuthModule {}
