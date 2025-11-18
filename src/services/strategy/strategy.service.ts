import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";
import { ExceptionService } from "../interceptor/interceptor.service";
import { config } from "src/config";
import { ArgonService } from "../argon/argon.service";
import { Request } from "express";

export const enum PASSPORT_STRATEGY_KEY {
  JWT = "jwt",
  REFRESH_JWT = "refresh-jwt",
}

@Injectable()
export class JwtStrategyService extends PassportStrategy(
  Strategy,
  PASSPORT_STRATEGY_KEY.JWT,
) {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt_secret,
    });
  }

  async validate({ id }: any) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { id },
        include: {
          admin: true,
          secretary: true,
        },
      });

      if (!user) {
        this.exceptionService.throw("User not found", "UNAUTHORIZED");
        return;
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}

@Injectable()
export class RefreshJwtStrategyService extends PassportStrategy(
  Strategy,
  PASSPORT_STRATEGY_KEY.REFRESH_JWT,
) {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
    private argonService: ArgonService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req.cookies?.["refresh-token"];
        },
      ]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: config.refresh_jwt_secret,
    });
  }

  async validate(req: Request, { id, clientIp, userAgent }: any) {
    try {
      const refreshToken = req.cookies?.["refresh-token"];

      if (!refreshToken) {
        this.exceptionService.throw("Refresh token not found", "UNAUTHORIZED");
        return;
      }

      const user = await this.prismaService.user.findFirst({
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
        include: {
          admin: true,
          secretary: true,
          authSession: true,
        },
      });

      if (!user) {
        this.exceptionService.throw("User not found", "UNAUTHORIZED");
        return;
      }

      // const userAuthSession = user.authSession.find(as => as.userId === id);
      const userAuthSession = await this.prismaService.authSession.findFirst({
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
          ],
        },
      });

      if (!userAuthSession) {
        this.exceptionService.throw("Auth session not found", "UNAUTHORIZED");
        return;
      }

      const verifyRefreshToken = await this.argonService.verifyHash(
        userAuthSession.token_hash || "",
        refreshToken,
      );

      if (!verifyRefreshToken) {
        this.exceptionService.throw("Invalid refresh token", "UNAUTHORIZED");
        return;
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}
