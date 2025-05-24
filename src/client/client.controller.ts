import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ClientService } from "./client.service";
import { CreateUpdateClientDto } from "./dto";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT))
@Controller("clients")
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Get()
  onGetClients() {
    return this.clientService.getClients();
  }

  @Post("create")
  onCreateClient(@Body() dto: CreateUpdateClientDto) {
    return this.clientService.createClient(dto);
  }

  @Patch("update/:id")
  onUpdateClient(@Param("id") id: string, @Body() dto: CreateUpdateClientDto) {
    return this.clientService.updateClient(id, dto);
  }

  @Delete("delete/:id")
  onDeleteClient(@Param("id") id: string) {
    return this.clientService.deleteClient(id);
  }

  @Get(":id")
  onGetClient(@Param("id") id: string) {
    return this.clientService.getClient(id);
  }
}
