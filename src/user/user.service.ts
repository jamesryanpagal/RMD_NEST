import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { PrismaService } from "src/services/prisma/prisma.service";
import { UserFullDetailsProps } from "src/type";

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

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

  async deleteUser(id: string) {
    try {
      await this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          status: "DELETED",
        },
      });
      return "User Deleted Successfully";
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id: string, dto: UserFullDetailsProps) {
    const { firstName, lastName, middleName, email, phone } = dto || {};
    try {
    } catch (error) {
      throw error;
    }
  }
}
