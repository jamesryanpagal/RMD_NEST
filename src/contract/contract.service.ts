import { Injectable } from "@nestjs/common";
import { CreateContractDto } from "./dto";
import { PrismaService } from "src/services/prisma/prisma.service";

@Injectable()
export class ContractService {
  constructor(private prismaService: PrismaService) {}

  async createContract(
    clientId: string,
    lotId: string,
    dto: CreateContractDto,
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
}
