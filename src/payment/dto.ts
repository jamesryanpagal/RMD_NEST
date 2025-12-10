import { Transform, Type } from "class-transformer";
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
  id?: string;
  reservationId?: string | null;
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
  penaltyCount?: number;
  penalized?: boolean;
  waivedPenalty?: boolean | null;
  paid: boolean;
  files?: PaymentFiles[];
  ignored?: boolean;
};

export class PaymentHistoryQueryDto {
  @IsOptional()
  @IsString()
  contractId?: string;
}

export class UpdatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) =>
    value !== null || value !== undefined ? Number(value) : null,
  )
  amount: number;

  @IsNotEmpty()
  @IsString()
  paymentDate: string;

  @IsNotEmpty()
  @IsEnum($Enums.MODE_OF_PAYMENT)
  modeOfPayment: $Enums.MODE_OF_PAYMENT;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || null)
  referenceNumber?: string;
}

export class CreateFullPaymentDto {
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

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) =>
    value !== null || value !== undefined ? Number(value) : null,
  )
  penaltyAmount?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => String)
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === "") {
      return false;
    }

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const lowercased = value.toLowerCase().trim();
      return lowercased === "true" || lowercased === "1";
    }

    return Boolean(value);
  })
  waivePenalty?: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || null)
  waivedReason?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) =>
    value !== null || value !== undefined ? Number(value) : null,
  )
  discount?: number;
}

export class CreatePaymentDto {
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

  @IsOptional()
  @IsBoolean()
  @Type(() => String)
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === "") {
      return false;
    }

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const lowercased = value.toLowerCase().trim();
      return lowercased === "true" || lowercased === "1";
    }

    return Boolean(value);
  })
  waivePenalty?: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || null)
  waivedReason?: string;
}

export class ApplyPenaltyPaymentDto {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) =>
    value !== null || value !== undefined ? Number(value) : null,
  )
  penaltyAmount: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) =>
    value !== null || value !== undefined ? Number(value) : null,
  )
  penaltyCount: number;
}

export class AdjustReservationValidityDto {
  @IsNotEmpty()
  @IsString()
  validity: string;
}
