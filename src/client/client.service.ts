import { Injectable } from "@nestjs/common";
import { $Enums, Prisma } from "generated/prisma";
import { PrismaService } from "src/services/prisma/prisma.service";
import { CreateClientServiceDto, CreateUpdateClientDto } from "./dto";
import { UserFullDetailsProps } from "src/type";
import { ExceptionService } from "src/services/interceptor/interceptor.service";

@Injectable()
export class ClientService {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
  ) {}

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

  async createClient(dto: CreateClientServiceDto, user?: UserFullDetailsProps) {
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
          createdBy: user?.id,
        },
      });

      return "Client created successfully";
    } catch (error) {
      throw error;
    }
  }

  async updateClient(
    id: string,
    dto: CreateUpdateClientDto,
    user?: UserFullDetailsProps,
  ) {
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
      await this.prismaService.$transaction(async prisma => {
        if (!user) {
          this.exceptionService.throw("User not found", "BAD_REQUEST");
          return;
        }

        const { role } = user;

        if (role === "ADMIN") {
          await prisma.client.update({
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
              updatedBy: user.id,
            },
          });
        } else {
          await prisma.clientRequest.create({
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
              requestType: "UPDATE",
              createdBy: user.id,
              client: {
                connect: {
                  id,
                },
              },
            },
          });
        }
      });
      return "Client updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async deleteClient(id: string, user?: UserFullDetailsProps) {
    try {
      await this.prismaService.$transaction(async prisma => {
        if (!user) {
          this.exceptionService.throw("User not found", "BAD_REQUEST");
          return;
        }

        const { role } = user || {};

        if (role === "ADMIN") {
          await this.prismaService.client.update({
            where: {
              id,
            },
            data: {
              status: "DELETED",
              deletedBy: user.id,
            },
          });
        } else {
          const clientResponse = await this.prismaService.client.findFirst({
            where: {
              AND: [
                {
                  id,
                },
                {
                  status: "ACTIVE",
                },
              ],
            },
          });

          if (!clientResponse) {
            this.exceptionService.throw(
              "Client not found, data might be already deleted.",
              "BAD_REQUEST",
            );
            return;
          }

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
          } = clientResponse || {};

          await this.prismaService.clientRequest.create({
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
              requestType: "DELETE",
              createdBy: user.id,
              client: {
                connect: {
                  id,
                },
              },
            },
          });
        }
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
