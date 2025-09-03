import { Module } from "@nestjs/common";
import { ReservationController } from "./reservation.controller";
import { ReservationService } from "./reservation.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { UploadService } from "src/services/upload/upload.service";
import { PaymentService } from "src/payment/payment.service";
import { FormatterService } from "src/services/formatter/formatter.service";
import { FileService } from "src/file/file.service";
import { MessagingService } from "src/services/messaging/messaging.service";

@Module({
  controllers: [ReservationController],
  providers: [
    ReservationService,
    PrismaService,
    MtzService,
    ExceptionService,
    UploadService,
    PaymentService,
    FormatterService,
    FileService,
    MessagingService,
  ],
})
export class ReservationModule {}
