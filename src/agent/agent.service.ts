import { Injectable } from "@nestjs/common";
import { Prisma } from "generated/prisma";
import { QuerySearchDto } from "src/dto";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { UserFullDetailsProps } from "src/type";

@Injectable()
export class AgentService {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
  ) {}

  async createAgent(dto: Prisma.AgentCreateInput, user?: UserFullDetailsProps) {
    const { firstName, middleName, lastName, birthDate } = dto || {};
    try {
      await this.prismaService.agent.create({
        data: {
          firstName,
          middleName,
          lastName,
          birthDate,
          createdBy: user?.id,
        },
      });

      return "Agent created successfully";
    } catch (error) {
      throw error;
    }
  }

  async updateAgent(
    id: string,
    dto: Prisma.AgentUpdateInput,
    user?: UserFullDetailsProps,
  ) {
    const { firstName, middleName, lastName, birthDate } = dto || {};
    try {
      await this.prismaService.agent.update({
        where: {
          id,
        },
        data: {
          firstName,
          middleName,
          lastName,
          birthDate,
          updatedBy: user?.id,
        },
      });

      return "Agent updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async getAgents(query: QuerySearchDto) {
    try {
      const { search } = query || {};
      const searchArr = search?.split(" ") || [];
      const whereQuery: Prisma.AgentWhereInput = {
        status: {
          not: "DELETED",
        },
        ...(search && {
          OR: [
            {
              firstName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              middleName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              firstName: {
                in: searchArr,
                mode: "insensitive",
              },
            },
            {
              middleName: {
                in: searchArr,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                in: searchArr,
                mode: "insensitive",
              },
            },
          ],
        }),
      };
      return await this.prismaService.agent.findMany({
        where: whereQuery,
        omit: {
          status: true,
          dateCreated: true,
          dateUpdated: true,
          dateDeleted: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getAgent(id: string) {
    try {
      return await this.prismaService.agent.findFirst({
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
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteAgent(id: string, user?: UserFullDetailsProps) {
    try {
      await this.prismaService.$transaction(async prisma => {
        const checkAgentStatus = await prisma.agent.findFirst({
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
          include: {
            agentCommission: {
              where: {
                status: { notIn: ["CONTRACT_FORFEITED", "DELETED"] },
              },
            },
            contract: {
              where: {
                status: { notIn: ["DELETED", "FORFEITED"] },
              },
            },
          },
        });

        if (!checkAgentStatus) {
          this.exceptionService.throw("Agent not found", "NOT_FOUND");
          return;
        }

        if (
          !!checkAgentStatus.agentCommission.length ||
          !!checkAgentStatus.contract.length
        ) {
          this.exceptionService.throw(
            "Cannot delete agent with active commissions or contracts",
            "BAD_REQUEST",
          );
          return;
        }

        await prisma.agent.update({
          where: {
            id,
          },
          data: {
            status: "DELETED",
            deletedBy: user?.id,
          },
        });
      });

      return "Agent deleted successfully";
    } catch (error) {
      throw error;
    }
  }
}
