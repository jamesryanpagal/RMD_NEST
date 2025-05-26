import { Injectable } from "@nestjs/common";
import { CreateUpdateContractDto } from "./dto";
import { PrismaService } from "src/services/prisma/prisma.service";
import { Prisma } from "generated/prisma";

@Injectable()
export class ContractService {
  constructor(private prismaService: PrismaService) {}

  async createContract(
    clientId: string,
    lotId: string,
    dto: CreateUpdateContractDto,
  ) {
    const {
      agent,
      commission,
      downPayment,
      miscellaneous,
      sqmPrice,
      terms,
      paymentType,
    } = dto || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        await prisma.contract.create({
          data: {
            sqmPrice,
            downPayment,
            terms,
            miscellaneous,
            agent,
            commission,
            paymentType,
            lot: {
              connect: {
                id: lotId,
              },
            },
            client: {
              connect: {
                id: clientId,
              },
            },
          },
        });
      });

      return "Contract Created";
    } catch (error) {
      throw error;
    }
  }

  async getContracts() {
    try {
      return await this.prismaService.contract.findMany({
        where: {
          status: { not: "DELETED" },
        },
        omit: {
          status: true,
          dateCreated: true,
          dateUpdated: true,
          dateDeleted: true,
        },
        include: {
          lot: {
            omit: {
              status: true,
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
            },
          },
          client: {
            omit: {
              status: true,
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateContract(id: string, dto: Prisma.ContractUpdateInput) {
    const {
      agent,
      commission,
      downPayment,
      miscellaneous,
      sqmPrice,
      terms,
      paymentType,
    } = dto || {};
    try {
      await this.prismaService.contract.update({
        where: {
          id,
        },
        data: {
          sqmPrice,
          downPayment,
          terms,
          miscellaneous,
          agent,
          commission,
          paymentType,
        },
      });

      return "Contract Updated";
    } catch (error) {
      throw error;
    }
  }

  async deleteContract(id: string) {
    try {
      await this.prismaService.contract.update({
        where: {
          id,
        },
        data: {
          status: "DELETED",
        },
      });

      return "Contract Deleted";
    } catch (error) {
      throw error;
    }
  }

  async getContract(id: string) {
    try {
      return await this.prismaService.contract.findFirst({
        where: {
          AND: [
            {
              id,
            },
            {
              status: { not: "DELETED" },
            },
          ],
        },
        omit: {
          status: true,
          dateCreated: true,
          dateUpdated: true,
          dateDeleted: true,
        },
        include: {
          lot: {
            omit: {
              status: true,
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
            },
          },
          client: {
            omit: {
              status: true,
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
