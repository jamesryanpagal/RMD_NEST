import { Transform } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
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

  @IsNotEmpty()
  @IsEnum($Enums.DOWN_PAYMENT_TYPE)
  downPaymentType: $Enums.DOWN_PAYMENT_TYPE;

  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : null))
  downPayment?: number;

  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : null))
  downPaymentTerms?: number;

  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  terms?: number;

  @IsNotEmpty()
  @IsEnum($Enums.PAYMENT_TYPE)
  paymentType: $Enums.PAYMENT_TYPE;
}
