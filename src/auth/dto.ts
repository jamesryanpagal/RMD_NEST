import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { $Enums, Prisma } from "generated/prisma";

export type LoginServiceDto = Pick<
  Prisma.UserCreateInput,
  "email" | "password"
>;

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class CreateAccountDto {
  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  middleName?: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  phone?: string;

  @IsNotEmpty()
  mobile: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  houseNumber?: string;

  @IsNotEmpty()
  street: string;

  @IsNotEmpty()
  barangay: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  subdivision?: string;

  @IsNotEmpty()
  city: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  province?: string;

  @IsNotEmpty()
  region: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  zip?: string;

  @IsEnum($Enums.ROLE)
  role: $Enums.ROLE;
}
