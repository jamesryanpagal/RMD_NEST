import { Module } from "@nestjs/common";
import { ReservationController } from "./reservation.controller";
import { ReservationService } from "./reservation.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";

@Module({
  controllers: [ReservationController],
  providers: [ReservationService, PrismaService, MtzService, ExceptionService],
})
export class ReservationModule {}
