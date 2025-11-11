import { config, GlobalValidationPipes } from "./config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  ExceptionService,
  ResponseService,
} from "./services/interceptor/interceptor.service";
import * as cookieParser from "cookie-parser";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { UploadConfig } from "./services/upload/upload.service";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: [config.cors_prod_full, config.cors_prod, config.cors_local],
    credentials: true,
  });
  app.useStaticAssets(join(__dirname, "..", UploadConfig.root), {
    prefix: UploadConfig.prefix,
  });
  app.setGlobalPrefix(config.global_prefix);
  app.useGlobalPipes(GlobalValidationPipes);
  app.useGlobalInterceptors(new ResponseService());
  app.useGlobalFilters(new ExceptionService());
  // ? change port in ec2 to be "0.0.0.0"
  await app.listen(config.port, "0.0.0.0");
}
bootstrap();
