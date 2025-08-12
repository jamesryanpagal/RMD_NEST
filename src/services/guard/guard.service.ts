import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ExceptionService } from "../interceptor/interceptor.service";
import { ROLES_KEY } from "src/decorator";
import { $Enums } from "generated/prisma/wasm";
import { UserFullDetailsProps } from "src/type";

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
