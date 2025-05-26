import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { MtzService } from "src/services/mtz/mtz.service";

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService, ExceptionService, MtzService],
})
export class PaymentModule {}
