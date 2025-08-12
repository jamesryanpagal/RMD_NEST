import { Module } from "@nestjs/common";
import { CronService } from "./cron.service";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaService } from "src/services/prisma/prisma.service";
import { FormatterService } from "src/services/formatter/formatter.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { MessagingService } from "src/services/messaging/messaging.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    CronService,
    PrismaService,
    MtzService,
    FormatterService,
    MessagingService,
    ExceptionService,
  ],
})
export class CronModule {}
