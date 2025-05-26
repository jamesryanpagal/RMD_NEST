import { Module } from "@nestjs/common";
import { ContractController } from "./contract.controller";
import { ContractService } from "./contract.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { MtzService } from "src/services/mtz/mtz.service";

@Module({
  controllers: [ContractController],
  providers: [ContractService, PrismaService, MtzService],
})
export class ContractModule {}
