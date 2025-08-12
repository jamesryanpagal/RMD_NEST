import { Module } from "@nestjs/common";
import { FileController } from "./file.controller";
import { FileService } from "./file.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { UploadService } from "src/services/upload/upload.service";

@Module({
  controllers: [FileController],
  providers: [
    FileService,
    PrismaService,
    ExceptionService,
    UploadService,
    ExceptionService,
  ],
})
export class FileModule {}
