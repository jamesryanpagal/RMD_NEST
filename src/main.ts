import { config, GlobalValidationPipes } from "./config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  ExceptionService,
  ResponseService,
} from "./services/interceptor/interceptor.service";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({ origin: config.client, credentials: true });
  app.setGlobalPrefix(config.global_prefix);
  app.useGlobalPipes(GlobalValidationPipes);
  app.useGlobalInterceptors(new ResponseService());
  app.useGlobalFilters(new ExceptionService());
  await app.listen(config.port);
}
bootstrap();
