import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { ClientController } from "./client.controller";
import { ClientService } from "./client.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ExistingClientMiddleware } from "src/middleware/client/client.middleware";
import { ExceptionService } from "src/services/interceptor/interceptor.service";

@Module({
  controllers: [ClientController],
  providers: [ClientService, PrismaService, ExceptionService],
})
export class ClientModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ExistingClientMiddleware)
      .forRoutes(
        { path: "clients/create", method: RequestMethod.POST },
        { path: "clients/update/:id", method: RequestMethod.PATCH },
      );
  }
}
