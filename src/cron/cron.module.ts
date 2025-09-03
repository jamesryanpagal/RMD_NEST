import { Module } from "@nestjs/common";
import { CronService } from "./cron.service";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaService } from "src/services/prisma/prisma.service";
import { FormatterService } from "src/services/formatter/formatter.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { MessagingService } from "src/services/messaging/messaging.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { ReservationService } from "src/reservation/reservation.service";
import { PaymentService } from "src/payment/payment.service";
import { UploadService } from "src/services/upload/upload.service";
import { FileService } from "src/file/file.service";

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    CronService,
    PrismaService,
    MtzService,
    FormatterService,
    MessagingService,
    ExceptionService,
    ReservationService,
    PaymentService,
    UploadService,
    FileService,
  ],
})
export class CronModule {}
