import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateAccountAdminDto, LoginDto } from "./dto";
import { Request as ExpressRequest, Response } from "express";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { AuthGuard } from "@nestjs/passport";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  onLogin(
    @Body() _dto: LoginDto,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(res, req.id);
  }

  @UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT))
  @Post("create/account/admin")
  onCreateAccountAdmin(@Body() dto: CreateAccountAdminDto) {
    return this.authService.createAccountAdmin(dto);
  }
}
