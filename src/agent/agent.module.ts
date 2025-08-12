import { Module } from "@nestjs/common";
import { AgentController } from "./agent.controller";
import { AgentService } from "./agent.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";

@Module({
  controllers: [AgentController],
  providers: [AgentService, PrismaService, ExceptionService],
})
export class AgentModule {}
