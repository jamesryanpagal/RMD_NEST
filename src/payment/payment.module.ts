import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { FormatterService } from "src/services/formatter/formatter.service";

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PrismaService,
    ExceptionService,
    MtzService,
    FormatterService,
  ],
})
export class PaymentModule {}
