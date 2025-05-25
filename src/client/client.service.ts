import { Injectable } from "@nestjs/common";
import { Prisma } from "generated/prisma";
import { PrismaService } from "src/services/prisma/prisma.service";
import { CreateClientServiceDto } from "./dto";

@Injectable()
export class ClientService {
  constructor(private prismaService: PrismaService) {}

  async getClients() {
    try {
      return await this.prismaService.client.findMany({
        where: {
          status: { not: "DELETED" },
        },
        orderBy: {
          firstName: "asc",
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

  async createClient(dto: CreateClientServiceDto) {
    const {
      firstName,
      middleName,
      lastName,
      email,
      contactNumber,
      tinNumber,
      houseNumber,
      street,
      barangay,
      subdivision,
      city,
      province,
      region,
      zip,
    } = dto || {};
    try {
      await this.prismaService.client.create({
        data: {
          firstName,
          middleName,
          lastName,
          email,
          contactNumber,
          tinNumber,
          houseNumber,
          street,
          barangay,
          subdivision,
          city,
          province,
          region,
          zip,
        },
      });

      return "Client created successfully";
    } catch (error) {
      throw error;
    }
  }

  async updateClient(id: string, dto: Prisma.ClientUpdateInput) {
    const {
      firstName,
      middleName,
      lastName,
      email,
      contactNumber,
      tinNumber,
      houseNumber,
      street,
      barangay,
      subdivision,
      city,
      province,
      region,
      zip,
    } = dto || {};
    try {
      await this.prismaService.client.update({
        where: {
          id,
        },
        data: {
          firstName,
          middleName,
          lastName,
          email,
          contactNumber,
          tinNumber,
          houseNumber,
          street,
          barangay,
          subdivision,
          city,
          province,
          region,
          zip,
        },
      });

      return "Client updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async deleteClient(id: string) {
    try {
      await this.prismaService.client.update({
        where: {
          id,
        },
        data: {
          status: "DELETED",
        },
      });

      return "Client deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  async getClient(id: string) {
    try {
      return await this.prismaService.client.findFirst({
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
}
