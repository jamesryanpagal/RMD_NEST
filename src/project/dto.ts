import { Transform, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateBlockDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    return Number(value);
  })
  lot: number;
}

export class CreatePhaseDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @Type(() => CreateBlockDto)
  block: CreateBlockDto[];
}

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  projectName: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  description?: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  houseNumber?: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsString()
  barangay: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  subdivision?: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  province?: string;

  @IsNotEmpty()
  @IsString()
  region: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  zip?: string;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreatePhaseDto)
  phase: CreatePhaseDto[];
}

export class UpdateProjectNameAndDescription {
  @IsNotEmpty()
  @IsString()
  projectName: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProjectAddressDetails {
  @IsOptional()
  @IsString()
  houseNumber?: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  barangay: string;

  @IsString()
  @IsOptional()
  subdivision?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsString()
  @IsOptional()
  zip?: string;
}

export class UpdateProjectDto {
  @IsNotEmpty()
  @IsString()
  projectName: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  description?: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  houseNumber?: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsString()
  barangay: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  subdivision?: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  province?: string;

  @IsNotEmpty()
  @IsString()
  region: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  zip?: string;
}

export class LotDto {
  @IsNotEmpty({ message: "Title is required" })
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => value || null)
  sqm: number;
}

export class BlockDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => value || null)
  lot: number;
}

export class PhaseDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => BlockDto)
  block: BlockDto[];
}

export class UpdatePhaseDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}

export class UpdateBlockDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}

export class UpdateLotDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    return Number(value);
  })
  sqm: number;
}
