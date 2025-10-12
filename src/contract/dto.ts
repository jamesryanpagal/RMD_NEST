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
  @Transform(({ value }) =>
    value !== null || value !== undefined ? Number(value) : null,
  )
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

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || null)
  paymentStartDate?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) =>
    value !== undefined && value !== null ? Number(value) : null,
  )
  interest?: number;

  @IsOptional()
  @IsEnum($Enums.INSTALLMENT_TYPE)
  installmentType?: $Enums.INSTALLMENT_TYPE;
}

export class UpdatePaymentStartDateDto {
  @IsNotEmpty()
  @IsString()
  paymentStartDate: string;
}
