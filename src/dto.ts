import { IsOptional, IsString } from "class-validator";

export class QuerySearchDto {
  @IsOptional()
  @IsString()
  search?: string;
}
