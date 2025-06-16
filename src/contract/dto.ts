import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { $Enums } from "generated/prisma";

export class CreateUpdateContractDto {
  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : null))
  sqmPrice: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : null))
  totalLotPrice: number;

  @IsNotEmpty()
  @IsEnum($Enums.MISCELLANEOUS)
  miscellaneous: $Enums.MISCELLANEOUS;

  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : null))
  miscellaneousTotal: number;

  @IsNotEmpty()
  @IsEnum($Enums.COMMISSION)
  agentCommission: $Enums.COMMISSION;

  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : null))
  agentCommissionTotal: number;

  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : null))
  tcp: number;

  @IsOptional()
  @IsEnum($Enums.DOWN_PAYMENT_TYPE)
  downPaymentType?: $Enums.DOWN_PAYMENT_TYPE;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  downPayment?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  downPaymentTerms?: number;

  @IsOptional()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  terms?: number;

  @IsNotEmpty()
  @IsEnum($Enums.PAYMENT_TYPE)
  paymentType: $Enums.PAYMENT_TYPE;
}
