import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import { UserFullDetailsProps } from "src/type";
import {
  AssignClientDto,
  UpdatePasswordDto,
  UpdateUserAccessFunctionsDto,
  UpdateUserDto,
} from "./dto";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { ArgonService } from "src/services/argon/argon.service";
import { QueryIdDto, QuerySearchDto } from "src/dto";
import { Prisma } from "generated/prisma";
import { Request } from "express";
import { AuthService } from "src/auth/auth.service";
import {
  UpdateProjectAddressDetails,
  UpdateUserPersonalDetails,
} from "src/project/dto";

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

  async getUserClients(query: QueryIdDto, user?: UserFullDetailsProps) {
    try {
      let selectedUser: UserFullDetailsProps | undefined = user;

      if (query.id) {
        const queryUserResponse = await this.prismaService.user.findFirst({
          where: {
            AND: [
              {
                id: query.id,
              },
              {
                status: { not: "DELETED" },
              },
            ],
          },
          include: {
            admin: true,
            secretary: true,
          },
        });

        if (queryUserResponse) {
          selectedUser = queryUserResponse;
        }
      }

      const { clientAssigned } = selectedUser || {};

      return await this.prismaService.client.findMany({
        where: {
          AND: [
            {
              id: { in: clientAssigned },
            },
            {
              status: { not: "DELETED" },
            },
          ],
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async assignClient(
    id: string,
    dto: AssignClientDto,
    user?: UserFullDetailsProps,
  ) {
    const { clientIds } = dto || {};
    try {
      if (!user) {
        this.exceptionService.throw("User not found", "BAD_REQUEST");
        return;
      }

      await this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          clientAssigned: clientIds,
          updatedBy: user.id,
        },
      });

      return "Client assigned successfully";
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
    dto: UpdatePasswordDto,
    user?: UserFullDetailsProps,
  ) {
    const { currentPassword, newPassword } = dto || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        const userResponse = await prisma.user.findFirst({
          where: {
            AND: [
              {
                id: user?.id,
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

        const verifyPassword = await this.argonService.verifyHash(
          userResponse.password,
          currentPassword,
        );

        if (!verifyPassword) {
          this.exceptionService.throw(
            "Invalid current password",
            "BAD_REQUEST",
          );
          return;
        }

        const newHashPassword = await this.argonService.hash(newPassword);

        await prisma.user.update({
          where: {
            id: userResponse.id,
          },
          data: {
            password: newHashPassword,
            updatedBy: user?.id,
          },
        });
      });

      return "Password updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async updateUserAccessFunctions(
    id: string,
    dto: UpdateUserAccessFunctionsDto,
    user?: UserFullDetailsProps,
  ) {
    const { moduleAccess, moduleFunction } = dto || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        const userResponse = await prisma.user.findFirst({
          where: {
            id,
          },
          include: {
            admin: true,
            secretary: true,
          },
        });

        if (!userResponse) {
          this.exceptionService.throw("User not found", "NOT_FOUND");
          return;
        }

        const { role, admin, secretary } = userResponse || {};

        if (role === "ADMIN") {
          if (!admin) {
            this.exceptionService.throw("Admin not found", "NOT_FOUND");
            return;
          }

          await prisma.admin.update({
            where: {
              id: admin.id,
            },
            data: {
              moduleAccess,
              moduleFunction,
              updatedBy: user?.id,
            },
          });
        }

        if (role === "SECRETARY") {
          if (!secretary) {
            this.exceptionService.throw("Secretary not found", "NOT_FOUND");
            return;
          }

          await prisma.secretary.update({
            where: {
              id: secretary.id,
            },
            data: {
              moduleAccess,
              moduleFunction,
              updatedBy: user?.id,
            },
          });
        }
      });

      return "User access functions updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async updateUserAddressDetails(
    id: string,
    dto: UpdateProjectAddressDetails,
    user?: UserFullDetailsProps,
  ) {
    try {
      const {
        houseNumber,
        street,
        barangay,
        subdivision,
        city,
        province,
        region,
        zip,
      } = dto || {};

      await this.prismaService.$transaction(async prisma => {
        const userResponse = await prisma.user.findFirst({
          where: {
            id,
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
    } catch (error) {
      throw error;
    }
  }

  async updateUserPersonalDetails(
    id: string,
    dto: UpdateUserPersonalDetails,
    user?: UserFullDetailsProps,
  ) {
    try {
      const { firstName, middleName, lastName, email, mobile, phone } =
        dto || {};

      await this.prismaService.$transaction(async prisma => {
        const userResponse = await prisma.user.findFirst({
          where: {
            id,
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
            middleName,
            lastName,
            email,
            mobile,
            phone,
            updatedBy: user?.id,
          },
        });
      });

      return "User personal details updated successfully";
    } catch (error) {
      throw error;
    }
  }
}
