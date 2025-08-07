import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import { UploadFileDto } from "src/services/upload/dto";
import {
  UploadConfig,
  UploadService,
} from "src/services/upload/upload.service";
import { DeleteFilesDto } from "./dto";
import { PaymentFiles } from "src/payment/dto";
import { config } from "src/config";

@Injectable()
export class FileService {
  constructor(
    private prismaService: PrismaService,
    private uploadService: UploadService,
  ) {}

  async paymentUpdateFile(
    id: string,
    file: Express.Multer.File,
    dto: UploadFileDto,
  ) {
    const { description } = dto || {};
    try {
      const { originalname, path } = file || {};

      const ext = this.uploadService.extractFileExt(originalname);

      await this.prismaService.file.update({
        where: {
          id,
        },
        data: {
          path,
          name: originalname,
          ext,
          description,
        },
      });

      return "File updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(id: string) {
    try {
      await this.prismaService.$transaction(async prisma => {
        const fileResponse = await prisma.file.update({
          where: { id },
          data: {
            status: "DELETED",
          },
        });

        const { path } = fileResponse || {};

        await this.uploadService.rollback(path);

        await prisma.file.update({
          where: {
            id,
          },
          data: {
            name: null,
            path: null,
            ext: null,
          },
        });
      });

      return "File deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  async deleteFiles(dto: DeleteFilesDto) {
    try {
      await this.prismaService.$transaction(async prisma => {
        const { ids } = dto || {};
        if (!ids || !ids.length) {
          console.warn("No file IDs provided for deletion");
          return;
        }
        await Promise.all(
          ids.map(async id => {
            const fileResponse = await prisma.file.update({
              where: {
                id,
              },
              data: {
                status: "DELETED",
              },
            });

            const { path } = fileResponse || {};

            await this.uploadService.rollback(path);

            await prisma.file.update({
              where: {
                id,
              },
              data: {
                name: null,
                path: null,
                ext: null,
              },
            });
          }),
        );
      });

      return "Files deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  onFormatPaymentFilesResponse(files?: PaymentFiles[]) {
    if (!files || !files.length) {
      return [];
    }

    return files.map(({ path, ...rest }) => {
      return {
        ...rest,
        path: !!path
          ? `${config.file_prefix}${UploadConfig.prefix}${path.split("/").slice(1).join("/")}`
          : null,
      };
    });
  }
}
