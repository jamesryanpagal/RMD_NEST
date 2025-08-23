import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
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
}

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;
}
