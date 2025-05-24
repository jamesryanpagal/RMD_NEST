import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { $Enums } from "generated/prisma";

export class CreateContractDto {
  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : null))
  sqmPrice: number;

  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : null))
  downPayment: number;

  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : null))
  terms: number;

  @IsNotEmpty()
  @IsEnum($Enums.MISCELLANEOUS)
  miscellaneous: $Enums.MISCELLANEOUS;

  @IsNotEmpty()
  @IsString()
  agent: string;

  @IsNotEmpty()
  @IsEnum($Enums.COMMISSION)
  commission: $Enums.COMMISSION;

  @IsNotEmpty()
  @IsEnum($Enums.PAYMENT_TYPE)
  paymentType: $Enums.PAYMENT_TYPE;
}
