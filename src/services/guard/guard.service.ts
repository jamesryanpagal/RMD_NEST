import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ExceptionService } from "../interceptor/interceptor.service";
import { ROLES_KEY } from "src/decorator";
import { $Enums } from "generated/prisma/wasm";
import { UserFullDetailsProps } from "src/type";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private exceptionService: ExceptionService,
  ) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<$Enums.ROLE[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || !requiredRoles.length) {
      this.exceptionService.throw(
        "User not authorized for this request",
        "FORBIDDEN",
      );
      return false;
    }

    const { user } = context.switchToHttp().getRequest();

    const parsedUser: UserFullDetailsProps | null = user;

    if (!parsedUser) {
      this.exceptionService.throw("User not found", "FORBIDDEN");
      return false;
    }

    if (!requiredRoles.includes(parsedUser.role)) {
      this.exceptionService.throw(
        "User not authorized for this request",
        "FORBIDDEN",
      );
      return false;
    }

    return true;
  }
}

@Injectable()
export class EmailExistsGuard implements CanActivate {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { id: idParams } = request.params || {};
    const { email } = request.body || {};
    const userDetails = request?.user || {};

    if (!userDetails) {
      this.exceptionService.throw("User not found", "NOT_FOUND");
      return false;
    }

    const { id } = userDetails as UserFullDetailsProps;

    const isPostRequest = request.method === "POST";

    const existingUser = await this.prismaService.user.findFirst({
      where: {
        AND: [
          { email },
          !isPostRequest ? { id: { not: idParams || id } } : {},
          { status: { not: "DELETED" } },
        ],
      },
    });

    if (existingUser) {
      this.exceptionService.throw(
        "User with this email already exists",
        "BAD_REQUEST",
      );
      return false;
    }

    return true;
  }
}
