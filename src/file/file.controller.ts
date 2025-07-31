import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
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
