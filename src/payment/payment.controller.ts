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
import { PaymentService } from "./payment.service";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { CreateUpdatePaymentDto } from "./dto";
import { UploadService } from "src/services/upload/upload.service";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT))
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
    @Body() dto: CreateUpdatePaymentDto,
  ) {
    return this.paymentService.createContractPayment(contractId, files, dto);
  }

  // ? add file uploads
  @Post("release/agent/commission/:agentCommissionId")
  onReleaseAgentCommission(
    @Param("agentCommissionId") agentCommissionId: string,
    @Body() dto: CreateUpdatePaymentDto,
  ) {
    return this.paymentService.releaseAgentCommission(agentCommissionId, dto);
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
  ) {
    return this.paymentService.uploadPfp(paymentId, files);
  }

  @Patch("update/:id")
  onUpdatePayment(
    @Param("id") id: string,
    @Body() dto: CreateUpdatePaymentDto,
  ) {
    return this.paymentService.updatePayment(id, dto);
  }

  @Delete("delete/:id")
  onDeletePayment(@Param("id") id: string) {
    return this.paymentService.deletePayment(id);
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
