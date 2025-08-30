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
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { UserFullDetailsProps } from "src/type";

@Injectable()
export class FileService {
  constructor(
    private prismaService: PrismaService,
    private uploadService: UploadService,
    private exceptionService: ExceptionService,
  ) {}

  async paymentUpdateFile(
    id: string,
    file: Express.Multer.File,
    dto: UploadFileDto,
    user?: UserFullDetailsProps,
  ) {
    const { description } = dto || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        const { originalname, path } = file || {};

        const ext = this.uploadService.extractFileExt(originalname);

        if (!user) {
          this.exceptionService.throw("User not found", "NOT_FOUND");
          return;
        }

        const { role } = user || {};

        if (role === "SECRETARY") {
          const fileResponse = await prisma.file.findFirst({
            where: {
              AND: [
                {
                  id,
                },
                {
                  status: { not: "DELETED" },
                },
              ],
            },
          });

          if (!fileResponse) {
            this.exceptionService.throw("File not found", "NOT_FOUND");
            return;
          }

          const { path, ext, name, description } = fileResponse || {};

          await prisma.fileRequest.create({
            data: {
              path,
              ext,
              name,
              description,
              requestType: "UPDATE",
              createdBy: user.id,
              file: {
                connect: {
                  id,
                },
              },
            },
          });
        } else {
          await prisma.file.update({
            where: {
              id,
            },
            data: {
              path,
              name: originalname,
              ext,
              description,
              updatedBy: user.id,
            },
          });
        }
      });

      return "File updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(id: string, user?: UserFullDetailsProps) {
    try {
      await this.prismaService.$transaction(async prisma => {
        if (!user) {
          this.exceptionService.throw("User not found", "NOT_FOUND");
          return;
        }

        const { role } = user || {};

        if (role === "SECRETARY") {
          const fileResponse = await prisma.file.findFirst({
            where: {
              AND: [
                {
                  id,
                },
                {
                  status: { not: "DELETED" },
                },
              ],
            },
          });

          if (!fileResponse) {
            this.exceptionService.throw("File not found", "NOT_FOUND");
            return;
          }

          const { path, ext, name, description } = fileResponse || {};

          await prisma.fileRequest.create({
            data: {
              path,
              ext,
              name,
              description,
              requestType: "DELETE",
              createdBy: user.id,
              file: {
                connect: {
                  id,
                },
              },
            },
          });
        } else {
          // const fileResponse =
          await prisma.file.update({
            where: { id },
            data: {
              status: "DELETED",
            },
          });

          // const { path } = fileResponse || {};

          // await this.uploadService.rollback(path);

          // await prisma.file.update({
          //   where: {
          //     id,
          //   },
          //   data: {
          //     name: null,
          //     path: null,
          //     ext: null,
          //   },
          // });
        }
      });

      return "File deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  async deleteFiles(dto: DeleteFilesDto, user?: UserFullDetailsProps) {
    try {
      await this.prismaService.$transaction(async prisma => {
        const { ids } = dto || {};
        if (!ids || !ids.length) {
          console.warn("No file IDs provided for deletion");
          return;
        }

        if (!user) {
          this.exceptionService.throw("User not found", "NOT_FOUND");
          return;
        }

        const { role } = user || {};

        await Promise.all(
          ids.map(async id => {
            if (role === "SECRETARY") {
              const fileResponse = await prisma.file.findFirst({
                where: {
                  AND: [
                    {
                      id,
                    },
                    {
                      status: { not: "DELETED" },
                    },
                  ],
                },
              });

              if (!fileResponse) {
                this.exceptionService.throw("File not found", "NOT_FOUND");
                return;
              }

              const { path, ext, name, description } = fileResponse || {};

              await prisma.fileRequest.create({
                data: {
                  path,
                  ext,
                  name,
                  description,
                  requestType: "DELETE",
                  createdBy: user.id,
                  file: {
                    connect: {
                      id,
                    },
                  },
                },
              });
            } else {
              // const fileResponse =
              await prisma.file.update({
                where: {
                  id,
                },
                data: {
                  status: "DELETED",
                  deletedBy: user.id,
                },
              });

              // const { path } = fileResponse || {};

              // await this.uploadService.rollback(path);

              // await prisma.file.update({
              //   where: {
              //     id,
              //   },
              //   data: {
              //     name: null,
              //     path: null,
              //     ext: null,
              //   },
              // });
            }
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

  uploadStaticFile(file: Express.Multer.File) {
    try {
      if (!file) {
        this.exceptionService.throw("File not provided", "BAD_REQUEST");
        return;
      }

      return "Static file uploaded successfully";
    } catch (error) {
      this.uploadService.rollback(file.path);
      throw error;
    }
  }
}
