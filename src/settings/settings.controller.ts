import { Body, Controller, Patch, Req, UseGuards } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { RolesGuard } from "src/services/guard/guard.service";
import { Roles } from "src/decorator";
import { $Enums } from "generated/prisma";
import { SettingsDto } from "./dto";
import { Request } from "express";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT), RolesGuard)
@Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
@Controller("settings")
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Patch("update/theme")
  onUpdateTheme(@Body() dto: SettingsDto, @Req() req: Request) {
    return this.settingsService.updateTheme(dto, req.user);
  }
}
