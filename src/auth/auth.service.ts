import { Injectable } from "@nestjs/common";
import { CreateAccountDto } from "./dto";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ArgonService } from "src/services/argon/argon.service";
import { COOKIE_KEY, JwtAuthService } from "src/services/jwt/jwt.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { Request, Response } from "express";
import { UserFullDetailsProps } from "src/type";

export type TokenProps = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private argonService: ArgonService,
    private jwtService: JwtAuthService,
    private exceptionService: ExceptionService,
    private mtzService: MtzService,
  ) {}

  async login(res: Response, id?: string) {
    try {
      if (!id) {
        this.exceptionService.throw("Invalid email or password", "NOT_FOUND");
        return;
      }

      const tokenPayload = { id };

      const accessToken =
        await this.jwtService.signAccessTokenAsync(tokenPayload);
      const refreshToken =
        await this.jwtService.signRefreshTokenAsync(tokenPayload);

      const token_hash = await this.argonService.hash(refreshToken);

      const checkAuthSession = await this.prismaService.authSession.findFirst({
        where: {
          userId: id,
        },
      });

      if (!checkAuthSession) {
        await this.prismaService.authSession.create({
          data: {
            token_hash,
            expiration: this.mtzService
              .mtz(undefined, "dateTimeUTCZ")
              .add(7, "days")
              .toISOString(),
            user: {
              connect: {
                id,
              },
            },
          },
        });
      } else {
        const userAuthSession = await this.prismaService.authSession.findFirst({
          where: {
            userId: id,
          },
        });

        if (!userAuthSession) {
          this.exceptionService.throw(
            "User auth session not found",
            "UNAUTHORIZED",
          );
          return;
        }
        await this.prismaService.authSession.update({
          where: {
            id: userAuthSession.id,
          },
          data: {
            token_hash,
            expiration: this.mtzService
              .mtz(undefined, "dateTimeUTCZ")
              .add(7, "days")
              .toISOString(),
          },
        });
      }

      this.jwtService.manageCookie(
        "set",
        COOKIE_KEY.REFRESH_TOKEN,
        res,
        refreshToken,
      );

      return { accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  async createAccount(
    {
      firstName,
      middleName,
      lastName,
      email,
      password,
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
      role,
    }: CreateAccountDto,
    user?: UserFullDetailsProps,
  ) {
    console.log({ role });
    try {
      await this.prismaService.$transaction(async prisma => {
        const hashPassword = await this.argonService.hash(password);
        await prisma.user.create({
          data: {
            firstName,
            middleName,
            lastName,
            email,
            password: hashPassword,
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
            role,
            ...(role === "ADMIN" && {
              admin: {
                create: {
                  createdBy: user?.id,
                },
              },
            }),
            ...(role === "SECRETARY" && {
              secretary: {
                create: {
                  createdBy: user?.id,
                },
              },
            }),
            createdBy: user?.id,
          },
        });
      });

      return "Account Created Successfully";
    } catch (error) {
      throw error;
    }
  }

  async logout(req: Request, res: Response) {
    const { id } = (req.user as UserFullDetailsProps) || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        const userAuthSession = await prisma.authSession.findFirst({
          where: { userId: id },
        });

        if (!userAuthSession) {
          this.exceptionService.throw("User not found", "NOT_FOUND");
          return;
        }

        const { id: auth_session_id } = userAuthSession || {};

        await prisma.authSession.update({
          where: { id: auth_session_id },
          data: {
            token_hash: null,
          },
        });
      });

      this.jwtService.manageCookie("clear", COOKIE_KEY.REFRESH_TOKEN, res);

      return "Logout successful";
    } catch (error) {
      throw error;
    }
  }

  async regenerateRefreshToken(req: Request, res: Response) {
    const user = req.user || {};
    let response: TokenProps | null = null;
    try {
      if (!user) {
        this.exceptionService.throw("User not found", "UNAUTHORIZED");
      }

      await this.prismaService.$transaction(async prisma => {
        const { id } = user as UserFullDetailsProps;

        const tokenPayload = {
          id,
        };

        const accessToken =
          await this.jwtService.signAccessTokenAsync(tokenPayload);
        const refreshToken =
          await this.jwtService.signRefreshTokenAsync(tokenPayload);

        const token_hash = await this.argonService.hash(refreshToken);

        const userAuthSession = await prisma.authSession.findFirst({
          where: { userId: id },
        });

        if (!userAuthSession) {
          this.exceptionService.throw("User not found", "UNAUTHORIZED");
          return;
        }

        await prisma.authSession.update({
          where: { id: userAuthSession.id },
          data: {
            token_hash,
            expiration: this.mtzService
              .mtz(undefined, "dateTimeUTCZ")
              .add(7, "days")
              .toISOString(),
          },
        });

        response = {
          accessToken,
          refreshToken,
        };
      });

      if (!response) {
        this.exceptionService.throw(
          "Something went wrong while generating token",
          "INTERNAL_SERVER_ERROR",
        );
        return;
      }

      this.jwtService.manageCookie(
        "set",
        COOKIE_KEY.REFRESH_TOKEN,
        res,
        (response as TokenProps).refreshToken,
      );

      return response;
    } catch (error) {
      throw error;
    }
  }
}
