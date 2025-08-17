import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UploadFileDto } from "src/services/upload/dto";
import { UploadService } from "src/services/upload/upload.service";
import { FileService } from "./file.service";
import { DeleteFilesDto } from "./dto";
import { Request } from "express";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { RolesGuard } from "src/services/guard/guard.service";
import { Roles } from "src/decorator";
import { $Enums } from "generated/prisma";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT), RolesGuard)
@Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
@Controller("files")
export class FileController {
  constructor(private fileService: FileService) {}

  @Post("upload/static")
  @UseInterceptors(
    UploadService.validate({
      key: "file",
      path: "static",
      accepts: ["jpeg", "jpg", "png"],
    }),
  )
  onUploadStaticFile(@UploadedFile() file: Express.Multer.File) {
    return this.fileService.uploadStaticFile(file);
  }

  @Patch("payment/update/:id")
  @UseInterceptors(
    UploadService.validate({
      key: "file",
      path: "payments",
      accepts: ["jpeg", "jpg", "png"],
    }),
  )
  onPaymentUpdateFile(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Req() req: Request,
  ) {
    return this.fileService.paymentUpdateFile(id, file, dto, req.user);
  }

  @Delete("delete")
  onDeleteFiles(@Body() dto: DeleteFilesDto, @Req() req: Request) {
    return this.fileService.deleteFiles(dto, req.user);
  }

  @Delete("delete/:id")
  onDeleteFile(@Param("id") id: string, @Req() req: Request) {
    return this.fileService.deleteFile(id, req.user);
  }
}
