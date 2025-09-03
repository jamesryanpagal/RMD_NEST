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
import { AgentService } from "./agent.service";
import { AgentDto } from "./dto";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { RolesGuard } from "src/services/guard/guard.service";
import { $Enums } from "generated/prisma";
import { Roles } from "src/decorator";
import { QuerySearchDto } from "src/dto";
import { Request } from "express";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT), RolesGuard)
@Roles($Enums.ROLE.ADMIN)
@Controller("agents")
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Get()
  onGetAgents(@Query() query: QuerySearchDto) {
    return this.agentService.getAgents(query);
  }

  @Post("create")
  onCreateAgent(@Body() dto: AgentDto, @Req() req: Request) {
    return this.agentService.createAgent(dto, req.user);
  }

  @Patch("update/:id")
  onUpdateAgent(
    @Body() dto: AgentDto,
    @Param("id") id: string,
    @Req() req: Request,
  ) {
    return this.agentService.updateAgent(id, dto, req.user);
  }

  @Delete("delete/:id")
  onDeleteAgent(@Param("id") id: string, @Req() req: Request) {
    return this.agentService.deleteAgent(id, req.user);
  }

  @Get(":id")
  onGetAgent(@Param("id") id: string) {
    return this.agentService.getAgent(id);
  }
}
