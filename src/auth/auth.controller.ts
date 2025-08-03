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
import { CreateAccountAdminDto } from "./dto";

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

  @UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT))
  @Post("create/account/admin")
  onCreateAccountAdmin(@Body() dto: CreateAccountAdminDto) {
    return this.authService.createAccountAdmin(dto);
  }
}
