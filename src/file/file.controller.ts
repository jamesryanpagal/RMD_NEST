import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { UploadFileDto } from "src/services/upload/dto";
import { UploadService } from "src/services/upload/upload.service";
import { FileService } from "./file.service";
import { DeleteFilesDto } from "./dto";

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
  ) {
    return this.fileService.paymentUpdateFile(id, file, dto);
  }

  @Delete("delete")
  onDeleteFiles(@Body() dto: DeleteFilesDto) {
    return this.fileService.deleteFiles(dto);
  }

  @Delete("delete/:id")
  onDeleteFile(@Param("id") id: string) {
    return this.fileService.deleteFile(id);
  }
}
