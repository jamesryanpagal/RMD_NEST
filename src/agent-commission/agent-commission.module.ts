import { Module } from "@nestjs/common";
import { AgentCommissionController } from "./agent-commission.controller";
import { AgentCommissionService } from "./agent-commission.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";

@Module({
  controllers: [AgentCommissionController],
  providers: [
    AgentCommissionService,
    PrismaService,
    MtzService,
    ExceptionService,
  ],
})
export class AgentCommissionModule {}
