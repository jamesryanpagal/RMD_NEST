import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { AuthService } from "./auth.service";
import { CreateAccountDto } from "./dto";
import { RolesGuard } from "src/services/guard/guard.service";
import { Roles } from "src/decorator";
import { $Enums } from "generated/prisma";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  onLogin(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(res, req.id);
  }

  @UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT))
  @Patch("logout")
  onLogout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }

  @UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.REFRESH_JWT))
  @Post("jwt/refresh")
  onRefreshJwt(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.regenerateRefreshToken(req, res);
  }

  @UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT), RolesGuard)
  @Roles($Enums.ROLE.ADMIN)
  @Post("create/account")
  onCreateAccountAdmin(@Body() dto: CreateAccountDto) {
    return this.authService.createAccountAdmin(dto);
  }
}
