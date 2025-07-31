import { Injectable } from "@nestjs/common";
import { ExceptionService } from "../interceptor/interceptor.service";
import { access, unlink } from "fs/promises";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { constants } from "fs";

export type FileTypes = "jpeg" | "jpg" | "png" | "pdf";
export type FilePaths = "payments";

export type FileValidationProps = {
  key: string;
  path: FilePaths;
  fileSize?: number;
  accepts?: FileTypes[];
} & (SingleFileValidationProps | MultipleFilesValidationProps);

export type SingleFileValidationProps = {
  multiple?: false;
};

export type MultipleFilesValidationProps = {
  multiple?: true;
  maxCount?: number;
};

export const UploadConfig = {
  root: "uploads",
  prefix: "/assets/",
  minSize: 5 * 1024 * 1024,
  maxFilesCount: 5,
};

@Injectable()
export class UploadService {
  constructor(private exceptionService: ExceptionService) {}

  async rollback(path?: string | null) {
    try {
      if (!path) {
        console.warn("No file path provided for rollback");
        return;
      }

      try {
        await access(path, constants.F_OK);
        await unlink(path);
      } catch (accessError) {
        console.warn(
          `File path of ${path} does not exist in current "upload" directory. Ignoring rollback`,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  extractFileExt(path: string, removePrefix: boolean = true) {
    if (removePrefix) {
      return extname(path).replace(".", "");
    }
    return extname(path);
  }

  static validate(props: FileValidationProps) {
    const {
      key,
      path,
      fileSize = UploadConfig.minSize,
      accepts = ["jpeg", "jpg", "png", "pdf"],
    } = props;

    const destination = `${UploadConfig.root}/${path}`;
    const hashFileNameWithExt = (originalName: string) => {
      const hashFile = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join("");
      return `${hashFile}${extname(originalName)}`;
    };

    const onGetExt = (originalName: string) => {
      return extname(originalName).replace(".", "") as FileTypes;
    };

    const fileFilter = (
      _req: any,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      if (accepts.includes(onGetExt(file.originalname))) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"), false);
      }
    };

    if (!!props.multiple) {
      const { maxCount = UploadConfig.maxFilesCount } = props;
      return FilesInterceptor(key, maxCount, {
        storage: diskStorage({
          destination,
          filename: (_req, file, cb) => {
            cb(null, hashFileNameWithExt(file.originalname));
          },
        }),
        limits: { fileSize },
        fileFilter,
      });
    }

    return FileInterceptor(key, {
      storage: diskStorage({
        destination,
        filename: (_req, file, cb) => {
          cb(null, hashFileNameWithExt(file.originalname));
        },
      }),
      limits: { fileSize },
      fileFilter,
    });
  }
}
