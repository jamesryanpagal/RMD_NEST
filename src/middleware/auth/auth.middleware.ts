import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { CreateAccountAdminDto, LoginDto } from "src/auth/dto";
import { ArgonService } from "src/services/argon/argon.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PrismaService } from "src/services/prisma/prisma.service";

@Injectable()
export class LoginMiddleware implements NestMiddleware {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
    private argonService: ArgonService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const { email, password } = req.body as LoginDto;

    try {
      const user = await this.prismaService.user.findFirst({
        where: { email },
      });

      if (!user) {
        this.exceptionService.throw("Invalid email or password", "NOT_FOUND");
        return;
      }

      const { password: hashPassword, id } = user;

      const verifyPassword = await this.argonService.verifyHash(
        hashPassword,
        password,
      );

      if (!verifyPassword) {
        this.exceptionService.throw("Invalid email or password", "NOT_FOUND");
        return;
      }

      req.id = id;

      next();
    } catch (error) {
      throw error;
    }
  }
}

@Injectable()
export class SignupMiddleware implements NestMiddleware {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    try {
      const { email } = req.body as CreateAccountAdminDto;
      const user = await this.prismaService.user.findFirst({
        where: { AND: [{ email }, { status: "ACTIVE" }] },
      });

      if (!!user) {
        this.exceptionService.throw("Email already exists", "BAD_REQUEST");
        return;
      }

      next();
    } catch (error) {
      throw error;
    }
  }
}
