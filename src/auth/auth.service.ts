import { Injectable } from "@nestjs/common";
import { CreateAccountAdminServiceDto } from "./dto";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ArgonService } from "src/services/argon/argon.service";
import { COOKIE_KEY, JwtAuthService } from "src/services/jwt/jwt.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { Response } from "express";

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

      const checkAuthSession = await this.prismaService.authSession.findUnique({
        where: {
          id,
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
        await this.prismaService.authSession.update({
          where: {
            id,
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

  async createAccountAdmin({
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
  }: CreateAccountAdminServiceDto) {
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
            role: "ADMIN",
          },
        });
      });

      return "Account Created Successfully";
    } catch (error) {
      throw error;
    }
  }
}
