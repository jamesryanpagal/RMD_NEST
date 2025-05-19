import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { UserService } from "./user.service";
import { Request } from "express";
import { UserFullDetailsProps } from "src/type";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT))
@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  onGetUsers() {
    return this.userService.getUsers();
  }

  @Get("details")
  onGetUserDetails(@Req() req: Request) {
    return this.userService.getUserDetails(req.user);
  }

  @Patch("update/:id")
  onUpdateUser(@Param("id") id: string, @Body() dto: UserFullDetailsProps) {
    return this.userService.updateUser(id, dto);
  }

  @Patch("delete/:id")
  onDeleteUser(@Param("id") id: string) {
    return this.userService.deleteUser(id);
  }

  @Get(":id")
  onGetUser(@Param("id") id: string) {
    return this.userService.getUser(id);
  }
}
