import { Injectable } from "@nestjs/common";
import { $Enums } from "generated/prisma";
import { PrismaService } from "src/services/prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(private prismaService: PrismaService) {}

  private targetModule: Record<$Enums.MODULES, string> = {
    [$Enums.MODULES.PROJECT]: "projectAudit",
    [$Enums.MODULES.PHASE]: "phaseAudit",
    [$Enums.MODULES.BLOCK]: "blockAudit",
    [$Enums.MODULES.LOT]: "lotAudit",
    [$Enums.MODULES.CLIENT]: "clientAudit",
    [$Enums.MODULES.USER]: "userAudit",
    [$Enums.MODULES.CONTRACT]: "contractAudit",
    [$Enums.MODULES.PAYMENT]: "paymentAudit",
    [$Enums.MODULES.RESERVATION]: "reservationAudit",
    [$Enums.MODULES.AGENT]: "agentAudit",
    [$Enums.MODULES.AGENT_COMMISSION]: "agentCommissionAudit",
    [$Enums.MODULES.FILES]: "fileAudit",
    [$Enums.MODULES.REQUEST]: "requestAudit",
  };

  async audit(module: $Enums.MODULES) {
    try {
      return await this.prismaService[this.targetModule[module]].findMany({
        where: {
          status: { not: "DELETED" },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
