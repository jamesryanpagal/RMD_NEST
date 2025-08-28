import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { UserService } from "./user.service";
import { Request } from "express";
import { UpdatePasswordDto, UpdateUserDto } from "./dto";
import { EmailExistsGuard, RolesGuard } from "src/services/guard/guard.service";
import { Roles } from "src/decorator";
import { $Enums } from "generated/prisma";
import { QuerySearchDto } from "src/dto";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT), RolesGuard)
@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
  @Get()
  onGetUsers(@Query() query: QuerySearchDto) {
    return this.userService.getUsers(query);
  }

  @Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
  @Get("details")
  onGetUserDetails(@Req() req: Request) {
    return this.userService.getUserDetails(req.user);
  }

  @Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
  @UseGuards(EmailExistsGuard)
  @Patch("update")
  onUpdateCurrentDetails(@Body() dto: UpdateUserDto, @Req() req: Request) {
    return this.userService.updateUser(req.user?.id || "", dto, req.user);
  }

  @Roles($Enums.ROLE.ADMIN)
  @UseGuards(EmailExistsGuard)
  @Patch("update/:id")
  onUpdateUser(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    return this.userService.updateUser(id, dto, req.user);
  }

  @Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
  @Patch("change/password/:id")
  onUpdateUserPassword(
    @Param("id") id: string,
    @Body() dto: UpdatePasswordDto,
    @Req() req: Request,
  ) {
    return this.userService.updateUserPassword(id, dto, req.user);
  }

  @Roles($Enums.ROLE.ADMIN)
  @Delete("delete/:id")
  onDeleteUser(@Param("id") id: string, @Req() req: Request) {
    return this.userService.deleteUser(id, req.user);
  }

  @Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
  @Get(":id")
  onGetUser(@Param("id") id: string) {
    return this.userService.getUser(id);
  }
}
