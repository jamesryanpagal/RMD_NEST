import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ClientService } from "./client.service";
import { CreateUpdateClientDto } from "./dto";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { RolesGuard } from "src/services/guard/guard.service";
import { Roles } from "src/decorator";
import { $Enums } from "generated/prisma";
import { Request } from "express";
import { QuerySearchDto } from "src/dto";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT), RolesGuard)
@Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
@Controller("clients")
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Get()
  onGetClients(@Query() queryParams: QuerySearchDto) {
    return this.clientService.getClients(queryParams);
  }

  @Post("create")
  onCreateClient(@Body() dto: CreateUpdateClientDto, @Req() req: Request) {
    return this.clientService.createClient(dto, req.user);
  }

  @Patch("update/:id")
  onUpdateClient(
    @Param("id") id: string,
    @Body() dto: CreateUpdateClientDto,
    @Req() req: Request,
  ) {
    return this.clientService.updateClient(id, dto, req.user);
  }

  @Delete("delete/:id")
  onDeleteClient(@Param("id") id: string, @Req() req: Request) {
    return this.clientService.deleteClient(id, req.user);
  }

  @Get(":id")
  onGetClient(@Param("id") id: string) {
    return this.clientService.getClient(id);
  }
}
