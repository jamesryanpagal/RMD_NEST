import { IsArray, IsOptional, IsString } from "class-validator";

export class DeleteFilesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];
}
