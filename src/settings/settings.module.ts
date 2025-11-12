import { Module } from "@nestjs/common";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, PrismaService, ExceptionService],
})
export class SettingsModule {}
