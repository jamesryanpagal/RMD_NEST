import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ReservationService } from "./reservation.service";
import { ReservationDto } from "./dto";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { UploadService } from "src/services/upload/upload.service";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT))
@Controller("reservations")
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @Get()
  onGetReservations() {
    return this.reservationService.getReservations();
  }

  @Post("create/:lotId/:clientId")
  @UseInterceptors(
    UploadService.validate({
      key: "pfp",
      path: "reservations",
      multiple: true,
      accepts: ["png", "jpeg", "jpg"],
    }),
  )
  onCreateReservation(
    @Body() dto: ReservationDto,
    @Param("lotId") lotId: string,
    @Param("clientId") clientId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.reservationService.createReservation(
      lotId,
      clientId,
      dto,
      files,
    );
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
