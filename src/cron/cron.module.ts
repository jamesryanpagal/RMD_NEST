import { Module } from "@nestjs/common";
import { CronService } from "./cron.service";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { MtzService } from "src/services/mtz/mtz.service";

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [CronService, PrismaService, ExceptionService, MtzService],
})
export class CronModule {}
