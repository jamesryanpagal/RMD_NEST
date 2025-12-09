import { Transform } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { $Enums } from "generated/prisma";

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
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}

export class UpdateUserAccessFunctionsDto {
  @IsArray()
  @IsEnum($Enums.MODULE_ACCESS, { each: true })
  moduleAccess: $Enums.MODULE_ACCESS[];

  @IsArray()
  @IsEnum($Enums.MODULE_FUNCTION, { each: true })
  moduleFunction: $Enums.MODULE_FUNCTION[];
}

export class AssignClientDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  clientIds: string[];
}
