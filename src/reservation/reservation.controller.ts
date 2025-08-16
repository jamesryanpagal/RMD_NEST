import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ReservationService } from "./reservation.service";
import { ReservationDto } from "./dto";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { UploadService } from "src/services/upload/upload.service";
import { RolesGuard } from "src/services/guard/guard.service";
import { Roles } from "src/decorator";
import { $Enums } from "generated/prisma";
import { Request } from "express";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT), RolesGuard)
@Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
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
  onUpdateReservation(
    @Param("id") id: string,
    @Body() dto: ReservationDto,
    @Req() req: Request,
  ) {
    return this.reservationService.updateReservation(id, dto, req.user);
  }

  @Delete("delete/:id")
  onDeleteReservation(@Param("id") id: string, @Req() req: Request) {
    return this.reservationService.deleteReservation(id, req.user);
  }

  @Get(":id")
  onGetReservation(@Param("id") id: string) {
    return this.reservationService.getReservation(id);
  }
}
