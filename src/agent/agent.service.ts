import { Injectable } from "@nestjs/common";
import { Prisma } from "generated/prisma";
import { QuerySearchDto } from "src/dto";
import { PrismaService } from "src/services/prisma/prisma.service";

@Injectable()
export class AgentService {
  constructor(private prismaService: PrismaService) {}

  async createAgent(dto: Prisma.AgentCreateInput) {
    const { firstName, middleName, lastName, birthDate } = dto || {};
    try {
      await this.prismaService.agent.create({
        data: {
          firstName,
          middleName,
          lastName,
          birthDate,
        },
      });

      return "Agent created successfully";
    } catch (error) {
      throw error;
    }
  }

  async updateAgent(id: string, dto: Prisma.AgentUpdateInput) {
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

  async deleteAgent(id: string) {
    try {
      await this.prismaService.agent.update({
        where: {
          id,
        },
        data: {
          status: "DELETED",
        },
      });

      return "Agent deleted successfully";
    } catch (error) {
      throw error;
    }
  }
}
