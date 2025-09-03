import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import { CreateClientServiceDto, CreateUpdateClientDto } from "./dto";
import { UserFullDetailsProps } from "src/type";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { QuerySearchDto } from "src/dto";
import { Prisma } from "generated/prisma";

@Injectable()
export class ClientService {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
  ) {}

  async getClients(query: QuerySearchDto) {
    try {
      const { search } = query;
      const searchArr = search?.split(" ") || [];

      const whereQuery: Prisma.ClientWhereInput = {
        status: { not: "DELETED" },
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
      return await this.prismaService.client.findMany({
        where: whereQuery,
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
          include: {
            contract: {
              where: {
                status: { notIn: ["DELETED", "FORFEITED"] },
              },
            },
            reservation: {
              where: {
                status: { notIn: ["DELETED", "FORFEITED"] },
              },
            },
          },
        });

        if (!clientResponse) {
          this.exceptionService.throw(
            "Client not found, data might be already deleted.",
            "BAD_REQUEST",
          );
          return;
        }

        if (
          !!clientResponse.contract.length ||
          !!clientResponse.reservation.length
        ) {
          this.exceptionService.throw(
            "Cannot delete client with active contracts or reservations",
            "BAD_REQUEST",
          );
          return;
        }

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
