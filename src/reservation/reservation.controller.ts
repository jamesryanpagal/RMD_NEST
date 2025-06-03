import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ReservationService } from "./reservation.service";
import { ReservationDto } from "./dto";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT))
@Controller("reservations")
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @Get()
  onGetReservations() {
    return this.reservationService.getReservations();
  }

  @Post("create/:lotId/:clientId")
  onCreateReservation(
    @Body() dto: ReservationDto,
    @Param("lotId") lotId: string,
    @Param("clientId") clientId: string,
  ) {
    return this.reservationService.createReservation(lotId, clientId, dto);
  }

  @Patch("update/:id")
  onUpdateReservation(@Param("id") id: string, @Body() dto: ReservationDto) {
    return this.reservationService.updateReservation(id, dto);
  }

  @Delete("delete/:id")
  onDeleteReservation(@Param("id") id: string) {
    return this.reservationService.deleteReservation(id);
  }

  @Get(":id")
  onGetReservation(@Param("id") id: string) {
    return this.reservationService.getReservation(id);
  }
}
