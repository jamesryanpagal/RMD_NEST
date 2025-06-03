import { Injectable } from "@nestjs/common";
import { Prisma } from "generated/prisma";
import { PrismaService } from "src/services/prisma/prisma.service";

@Injectable()
export class AgentService {
  constructor(private prismaService: PrismaService) {}

  async createAgent(dto: Prisma.AgentCreateInput) {
    const { name, birthDate } = dto || {};
    try {
      await this.prismaService.agent.create({
        data: {
          name,
          birthDate,
        },
      });

      return "Agent created successfully";
    } catch (error) {
      throw error;
    }
  }

  async updateAgent(id: string, dto: Prisma.AgentUpdateInput) {
    const { name, birthDate } = dto || {};
    try {
      await this.prismaService.agent.update({
        where: {
          id,
        },
        data: {
          name,
          birthDate,
        },
      });

      return "Agent updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async getAgents() {
    try {
      return await this.prismaService.agent.findMany({
        where: {
          status: { not: "DELETED" },
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
