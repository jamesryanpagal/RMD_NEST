import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { $Enums } from "generated/prisma";

export class ReservationDto {
  @IsNotEmpty()
  @IsEnum($Enums.MODE_OF_PAYMENT)
  modeOfPayment: $Enums.MODE_OF_PAYMENT;

  @IsNotEmpty()
  @IsString()
  paymentDate: string;

  @IsNotEmpty()
  @Transform(({ value }) =>
    value !== null && value !== undefined ? Number(value) : null,
  )
  amount: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || null)
  referenceNumber?: string;
}
