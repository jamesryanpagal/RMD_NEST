import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import { UserFullDetailsProps } from "src/type";
import { UpdatePasswordDto, UpdateUserDto } from "./dto";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { ArgonService } from "src/services/argon/argon.service";
import { QuerySearchDto } from "src/dto";
import { Prisma } from "generated/prisma";
import { Request } from "express";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
    private argonService: ArgonService,
    private authService: AuthService,
  ) {}

  async getUsers(query: QuerySearchDto, user?: UserFullDetailsProps) {
    try {
      const { search } = query || {};
      const searchArr = search?.split(" ") || [];
      const whereQuery: Prisma.UserWhereInput = {
        status: { not: "DELETED" },
        id: { not: user?.id },
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
              email: {
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
            {
              email: {
                in: searchArr,
                mode: "insensitive",
              },
            },
          ],
        }),
      };
      return await this.prismaService.user.findMany({
        where: whereQuery,
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

  async getUserDetails(req: Request) {
    const { id } = req.user || {};
    const clientIp = this.authService.getClientIp(req);
    const userAgent = this.authService.getUserAgent(req);
    try {
      const authSessionResponse =
        await this.prismaService.authSession.findFirst({
          where: {
            AND: [
              {
                userId: id,
              },
              {
                clientIp,
              },
              {
                userAgent,
              },
              {
                accessToken: { not: null },
              },
              {
                token_hash: { not: null },
              },
            ],
          },
        });

      if (!authSessionResponse) {
        this.exceptionService.throw("Auth session not found", "UNAUTHORIZED");
        return;
      }

      const response = await this.prismaService.user.findFirst({
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
          settings: true,
        },
      });

      return { ...response, accessToken: authSessionResponse.accessToken };
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
