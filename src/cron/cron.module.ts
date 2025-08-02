import { Module } from "@nestjs/common";
import { CronService } from "./cron.service";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [CronService, PrismaService, ExceptionService],
})
export class CronModule {}
