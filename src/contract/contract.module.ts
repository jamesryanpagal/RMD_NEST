import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { ContractController } from "./contract.controller";
import { ContractService } from "./contract.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { ContractMiddleware } from "src/middleware/contract/contract.middleware";
import { ExceptionService } from "src/services/interceptor/interceptor.service";

@Module({
  controllers: [ContractController],
  providers: [ContractService, PrismaService, MtzService, ExceptionService],
})
export class ContractModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContractMiddleware).forRoutes({
      path: "contracts/create/:clientId/:lotId/:agentId",
      method: RequestMethod.POST,
    });
  }
}
