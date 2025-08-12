import { Module } from "@nestjs/common";
import { RequestController } from "./request.controller";
import { RequestService } from "./request.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";

@Module({
  controllers: [RequestController],
  providers: [RequestService, PrismaService, ExceptionService],
})
export class RequestModule {}
