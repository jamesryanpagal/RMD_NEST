import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AgentDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  middleName?: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  birthDate?: string;
}
