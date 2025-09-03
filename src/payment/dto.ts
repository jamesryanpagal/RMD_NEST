import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { $Enums } from "generated/prisma";

export type PaymentFiles = {
  id: string;
  path?: string | null;
  ext?: string | null;
  name?: string | null;
  description?: string | null;
};

export type PaymentBreakdownType = {
  modeOfPayment?: $Enums.MODE_OF_PAYMENT;
  paymentDate?: string;
  receiptNo?: string | null;
  dueDate: string;
  referenceNumber?: string | null;
  amount: number;
  remainingBalance: number;
  transactionType: $Enums.TRANSACTION_TYPE;
  paidAmount: number;
  penaltyAmount?: number;
  penalized?: boolean;
  paid: boolean;
  files?: PaymentFiles[];
};

export class PaymentHistoryQueryDto {
  @IsOptional()
  @IsString()
  contractId?: string;
}

export class CreateUpdatePaymentDto {
  @IsNotEmpty()
  @IsEnum($Enums.TRANSACTION_TYPE)
  transactionType: $Enums.TRANSACTION_TYPE;

  @IsNotEmpty()
  @IsEnum($Enums.MODE_OF_PAYMENT)
  modeOfPayment: $Enums.MODE_OF_PAYMENT;

  @IsNotEmpty()
  paymentDate: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : null))
  amount: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || null)
  referenceNumber?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }

    return Boolean(value);
  })
  sendReceipt?: boolean;
}
