import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AgentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  birthDate?: string;
}
