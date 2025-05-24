import { Module } from "@nestjs/common";
import { ContractController } from "./contract.controller";
import { ContractService } from "./contract.service";
import { PrismaService } from "src/services/prisma/prisma.service";

@Module({
  controllers: [ContractController],
  providers: [ContractService, PrismaService],
})
export class ContractModule {}
