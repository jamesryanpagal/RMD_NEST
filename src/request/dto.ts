import { IsEnum, IsNotEmpty } from "class-validator";
import { $Enums } from "generated/prisma";

export class ApproveRequestDto {
  @IsNotEmpty()
  @IsEnum($Enums.REQUEST_MODULE)
  module: $Enums.REQUEST_MODULE;
}

export class RejectDeleteRequestDto {
  @IsNotEmpty()
  @IsEnum($Enums.REQUEST_MODULE)
  module: $Enums.REQUEST_MODULE;

  @IsNotEmpty()
  @IsEnum($Enums.REQUEST_REJECT_DELETE)
  requestType: $Enums.REQUEST_REJECT_DELETE;
}
