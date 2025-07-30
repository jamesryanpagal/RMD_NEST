import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class StartAgentCommissionDto {
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => {
    return Number(value);
  })
  terms: number;
}
