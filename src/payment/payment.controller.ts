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
import { PaymentService } from "./payment.service";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { CreateUpdatePaymentDto } from "./dto";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT))
@Controller("payments")
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get()
  onGetPayments() {
    return this.paymentService.getPayments();
  }

  @Post("create/:contractId")
  onCreatePayment(
    @Param("contractId") contractId: string,
    @Body() dto: CreateUpdatePaymentDto,
  ) {
    return this.paymentService.createContractPayment(contractId, dto);
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

  @Get(":id")
  onGetPayment(@Param("id") id: string) {
    return this.paymentService.getPayment(id);
  }
}
