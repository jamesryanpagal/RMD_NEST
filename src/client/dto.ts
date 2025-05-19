import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Prisma } from "generated/prisma";

export type CreateClientServiceDto = Pick<
  Prisma.ClientCreateInput,
  | "firstName"
  | "middleName"
  | "lastName"
  | "email"
  | "contactNumber"
  | "tinNumber"
  | "houseNumber"
  | "street"
  | "barangay"
  | "subdivision"
  | "city"
  | "province"
  | "region"
  | "zip"
>;

export class CreateUpdateClientDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || null)
  middleName?: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  contactNumber: string;

  @IsNotEmpty()
  @IsString()
  tinNumber: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || null)
  houseNumber?: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsString()
  barangay: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || null)
  subdivision?: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || null)
  province?: string;

  @IsNotEmpty()
  @IsString()
  region: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || null)
  zip?: string;
}
