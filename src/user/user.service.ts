import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { PrismaService } from "src/services/prisma/prisma.service";
import { UserFullDetailsProps } from "src/type";
import { UpdatePasswordDto, UpdateUserDto } from "./dto";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { ArgonService } from "src/services/argon/argon.service";

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
    private argonService: ArgonService,
  ) {}

  async getUsers() {
    try {
      return await this.prismaService.user.findMany({
        where: {
          status: { not: "DELETED" },
        },
        omit: {
          password: true,
        },
        include: {
          admin: true,
          secretary: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getUserDetails(user?: UserFullDetailsProps) {
    const { id } = user || {};
    try {
      return await this.prismaService.user.findFirst({
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
          password: true,
        },
        include: {
          admin: true,
          secretary: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getUser(id: string) {
    try {
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id: string, user?: UserFullDetailsProps) {
    try {
      await this.prismaService.$transaction(async prisma => {
        const userResponse = await prisma.user.findFirst({
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
        });

        if (!userResponse) {
          this.exceptionService.throw(
            "User not found, user might be deleted already.",
            "NOT_FOUND",
          );
          return;
        }

        await prisma.user.update({
          where: {
            id,
          },
          data: {
            status: "DELETED",
            deletedBy: user?.id,
          },
        });
      });
      return "User Deleted Successfully";
    } catch (error) {
      throw error;
    }
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
    user?: UserFullDetailsProps,
  ) {
    const {
      firstName,
      lastName,
      middleName,
      email,
      phone,
      mobile,
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
        const userResponse = await prisma.user.findFirst({
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
        });

        if (!userResponse) {
          this.exceptionService.throw("User not found", "NOT_FOUND");
          return;
        }

        await prisma.user.update({
          where: {
            id,
          },
          data: {
            firstName,
            lastName,
            middleName,
            email,
            phone,
            mobile,
            houseNumber,
            street,
            barangay,
            subdivision,
            city,
            province,
            region,
            zip,
            updatedBy: user?.id,
          },
        });
      });

      return "User Updated Successfully";
    } catch (error) {
      throw error;
    }
  }

  async updateUserPassword(
    id: string,
    dto: UpdatePasswordDto,
    user?: UserFullDetailsProps,
  ) {
    try {
      await this.prismaService.$transaction(async prisma => {
        const userResponse = await prisma.user.findFirst({
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
        });

        if (!userResponse) {
          this.exceptionService.throw(
            "User not found, user might be deleted.",
            "NOT_FOUND",
          );
          return;
        }

        const hash = await this.argonService.hash(dto.password);

        await prisma.user.update({
          where: {
            id,
          },
          data: {
            password: hash,
            updatedBy: user?.id,
          },
        });
      });

      return "Password updated successfully";
    } catch (error) {
      throw error;
    }
  }
}
