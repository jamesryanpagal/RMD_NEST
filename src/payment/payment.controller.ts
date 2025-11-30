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
import { PaymentService } from "./payment.service";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import {
  AdjustReservationValidityDto,
  ApplyPenaltyPaymentDto,
  CreatePaymentDto,
  UpdatePaymentDto,
} from "./dto";
import { UploadService } from "src/services/upload/upload.service";
import { RolesGuard } from "src/services/guard/guard.service";
import { Roles } from "src/decorator";
import { $Enums } from "generated/prisma";
import { Request } from "express";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT), RolesGuard)
@Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
@Controller("payments")
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get()
  onGetPayments() {
    return this.paymentService.getPayments();
  }

  @Post("create/:contractId")
  @UseInterceptors(
    UploadService.validate({
      key: "pfp",
      path: "payments",
      multiple: true,
      accepts: ["png", "jpeg", "jpg"],
    }),
  )
  onCreatePayment(
    @Param("contractId") contractId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreatePaymentDto,
    @Req() req: Request,
  ) {
    return this.paymentService.createContractPayment(
      contractId,
      files,
      dto,
      req.user,
    );
  }

  @Post("release/agent/commission/:agentCommissionId")
  @UseInterceptors(
    UploadService.validate({
      key: "pfp",
      path: "payments",
      multiple: true,
      accepts: ["png", "jpeg", "jpg"],
    }),
  )
  onReleaseAgentCommission(
    @Param("agentCommissionId") agentCommissionId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreatePaymentDto,
    @Req() req: Request,
  ) {
    return this.paymentService.releaseAgentCommission(
      agentCommissionId,
      dto,
      files,
      req.user,
    );
  }

  @Post("upload/pfp/:paymentId")
  @UseInterceptors(
    UploadService.validate({
      key: "pfp",
      path: "payments",
      multiple: true,
      accepts: ["png", "jpeg", "jpg"],
    }),
  )
  onUploadPfp(
    @Param("paymentId") paymentId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    return this.paymentService.uploadPfp(paymentId, files, req.user);
  }

  @Patch("update/:id")
  onUpdatePayment(
    @Param("id") id: string,
    @Body() dto: UpdatePaymentDto,
    @Req() req: Request,
  ) {
    return this.paymentService.updatePayment(id, dto, req.user);
  }

  @Patch("apply/penalty/:id") // ? id represents contractId
  onApplyPenaltyPayment(
    @Param("id") id: string,
    @Body() dto: ApplyPenaltyPaymentDto,
    @Req() req: Request,
  ) {
    return this.paymentService.applyPenaltyPayment(id, dto, req.user);
  }

  @Patch("adjust/reservation/validity/:id")
  onAdjustReservationValidity(
    @Param("id") id: string,
    @Body() dto: AdjustReservationValidityDto,
    @Req() req: Request,
  ) {
    return this.paymentService.adjustReservationValidity(id, dto, req.user);
  }

  @Delete("delete/:id")
  onDeletePayment(@Param("id") id: string, @Req() req: Request) {
    return this.paymentService.deletePayment(id, req.user);
  }

  @Get("agent/commissions/breakdown/:id")
  onGetAgentCommissionBreakdown(@Param("id") id: string) {
    return this.paymentService.getAgentCommissionBreakdown(id);
  }

  @Get("commission/payment/history/:agentCommissionId")
  onGetCommissionPaymentHistory(
    @Param("agentCommissionId") agentCommissionId: string,
  ) {
    return this.paymentService.getCommissionPaymentHistory(agentCommissionId);
  }

  @Get("breakdown/:contractId")
  onGetPaymentBreakdown(@Param("contractId") contractId: string) {
    return this.paymentService.getPaymentBreakdown(contractId);
  }

  @Get("history/:contractId")
  onGetPaymentHistory(@Param("contractId") contractId: string) {
    return this.paymentService.getPaymentHistory(contractId);
  }

  @Get("reservation/:reservationId")
  onGetPaymentReservation(@Param("reservationId") reservationId: string) {
    return this.paymentService.getPaymentReservationHistory(reservationId);
  }

  @Get(":id")
  onGetPayment(@Param("id") id: string) {
    return this.paymentService.getPayment(id);
  }
}
