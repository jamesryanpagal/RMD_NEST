import { Injectable } from "@nestjs/common";
import { CreateAccountDto } from "./dto";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ArgonService } from "src/services/argon/argon.service";
import { COOKIE_KEY, JwtAuthService } from "src/services/jwt/jwt.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { Request, Response } from "express";
import { UserFullDetailsProps } from "src/type";
import { GeneratorService } from "src/services/generator/generator.service";
import { MessagingService } from "src/services/messaging/messaging.service";

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private argonService: ArgonService,
    private jwtService: JwtAuthService,
    private exceptionService: ExceptionService,
    private mtzService: MtzService,
    private generatorService: GeneratorService,
    private messagingService: MessagingService,
  ) {}

  async login(res: Response, req: Request) {
    try {
      const { user } = req;
      if (!user) {
        this.exceptionService.throw("Invalid email or password", "NOT_FOUND");
        return;
      }

      const clientIp = this.getClientIp(req);
      const userAgent = this.getUserAgent(req);

      const { id, role, admin, secretary } = user;

      const tokenPayload = { id, clientIp, userAgent };

      const accessToken =
        await this.jwtService.signAccessTokenAsync(tokenPayload);
      const refreshToken =
        await this.jwtService.signRefreshTokenAsync(tokenPayload);

      const token_hash = await this.argonService.hash(refreshToken);

      const session = await this.prismaService.authSession.findFirst({
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

      if (!session) {
        await this.prismaService.authSession.create({
          data: {
            user: {
              connect: {
                id,
              },
            },
            clientIp,
            userAgent,
            accessToken,
            token_hash,
            expiration: this.mtzService
              .mtz(undefined, "dateTimeUTCZ")
              .add(7, "days")
              .toISOString(),
          },
        });
      } else {
        await this.prismaService.authSession.update({
          where: {
            id: session.id,
          },
          data: {
            accessToken,
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

      const moduleAccess = admin?.moduleAccess.length
        ? admin.moduleAccess
        : secretary?.moduleAccess;

      return {
        accessToken,
        role,
        moduleAccess,
      };
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
      moduleAccess,
      moduleFunction,
    }: CreateAccountDto,
    user?: UserFullDetailsProps,
  ) {
    try {
      await this.prismaService.$transaction(async prisma => {
        const password = this.generatorService.generatePassword(6);
        const hashPassword = await this.argonService.hash(password);

        const defaultUsername = `${firstName.toLowerCase()}_${lastName.toLowerCase()}@${Math.floor(Math.random() * 900) + 100}`;

        await prisma.user.create({
          data: {
            username: defaultUsername,
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
                  moduleAccess,
                  moduleFunction,
                },
              },
            }),
            ...(role === "SECRETARY" && {
              secretary: {
                create: {
                  createdBy: user?.id,
                  moduleAccess,
                  moduleFunction,
                },
              },
            }),
            createdBy: user?.id,
          },
        });

        await this.messagingService.onSendUserCredentials(
          `${firstName} ${lastName}`,
          email,
          password,
          role,
        );
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
        const clientIp = this.getClientIp(req);
        const userAgent = this.getUserAgent(req);
        const userAuthSession = await prisma.authSession.findFirst({
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
          this.exceptionService.throw("User not found", "NOT_FOUND");
          return;
        }

        const { id: auth_session_id } = userAuthSession || {};

        await prisma.authSession.update({
          where: { id: auth_session_id },
          data: {
            accessToken: null,
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
    let response: { accessToken: string; refreshToken: string } | null = null;
    try {
      if (!user) {
        this.exceptionService.throw("User not found", "UNAUTHORIZED");
      }

      await this.prismaService.$transaction(async prisma => {
        const { id } = user as UserFullDetailsProps;

        const clientIp = this.getClientIp(req);
        const userAgent = this.getUserAgent(req);

        const tokenPayload = {
          id,
          clientIp,
          userAgent,
        };

        const accessToken =
          await this.jwtService.signAccessTokenAsync(tokenPayload);
        const refreshToken =
          await this.jwtService.signRefreshTokenAsync(tokenPayload);

        const token_hash = await this.argonService.hash(refreshToken);

        const userAuthSession = await prisma.authSession.findFirst({
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
          this.exceptionService.throw("User not found", "UNAUTHORIZED");
          return;
        }

        await prisma.authSession.update({
          where: { id: userAuthSession.id },
          data: {
            accessToken,
            token_hash,
            expiration: this.mtzService
              .mtz(undefined, "dateTimeUTCZ")
              .add(7, "days")
              .toISOString(),
          },
        });

        response = { accessToken, refreshToken };
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
        (response as any).refreshToken,
      );

      return (response as any).accessToken;
    } catch (error) {
      throw error;
    }
  }

  getClientIp(req: Request): string {
    // Priority 1: Check X-Forwarded-For header for public IP
    const xForwardedFor = req.headers["x-forwarded-for"];
    if (xForwardedFor) {
      const ips = (
        Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor
      )
        .split(",")
        .map(ip => ip.trim())
        .filter(ip => ip && ip !== "unknown");

      // Look for first public IP in the chain
      for (const ip of ips) {
        if (this.isPublicIp(ip)) {
          return ip;
        }
      }

      // If no public IP found, return first IP as fallback
      if (ips.length > 0) {
        return ips[0];
      }
    }

    // Priority 2: Check other proxy headers for public IP
    const proxyHeaders = [
      "x-real-ip",
      "cf-connecting-ip", // Cloudflare
      "true-client-ip", // Some CDNs
      "x-client-ip",
    ];

    for (const header of proxyHeaders) {
      const ip = req.headers[header] as string;
      if (ip) {
        const trimmedIp = ip.trim();
        if (this.isPublicIp(trimmedIp)) {
          return trimmedIp;
        }
      }
    }

    // Priority 3: Use req.ip (Express parsed when trust proxy is enabled)
    if (req.ip && this.isPublicIp(req.ip)) {
      return req.ip;
    }

    // Priority 4: Fallback to socket remote address (may be private IP)
    const socketIp = req.socket?.remoteAddress;
    if (socketIp) {
      // If it's a public IP, use it; otherwise continue to fallback
      if (this.isPublicIp(socketIp)) {
        return socketIp;
      }
      // Even if private, return it as last resort (better than "unknown")
      return socketIp;
    }

    return "unknown";
  }

  /**
   * Check if an IP address is a public/external IP (not private/internal)
   */
  private isPublicIp(ip: string): boolean {
    if (!ip || ip === "unknown" || ip === "localhost") {
      return false;
    }

    // IPv4 private ranges
    const privateRanges = [
      /^10\./, // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
      /^192\.168\./, // 192.168.0.0/16
      /^127\./, // 127.0.0.0/8 (loopback)
      /^169\.254\./, // 169.254.0.0/16 (link-local)
      /^0\./, // 0.0.0.0/8 (invalid)
    ];

    // Check if it's a private IPv4 address
    if (privateRanges.some(range => range.test(ip))) {
      return false;
    }

    // IPv6 private/localhost
    if (
      ip === "::1" ||
      ip.startsWith("::ffff:127.") ||
      ip.startsWith("::ffff:10.") ||
      ip.startsWith("::ffff:192.168.") ||
      ip.startsWith("::ffff:172.") ||
      ip.startsWith("fe80:") || // Link-local
      ip.startsWith("fc00:") || // Unique local
      ip.startsWith("fd00:") // Unique local
    ) {
      return false;
    }

    // If it doesn't match private patterns, assume it's public
    return true;
  }

  getUserAgent(req: Request): string {
    return req.headers["user-agent"] || "unknown";
  }
}
