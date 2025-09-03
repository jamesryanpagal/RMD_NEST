import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
} from "@nestjs/common";
import { AgentCommissionService } from "./agent-commission.service";
import { StartAgentCommissionDto } from "./dto";
import { QuerySearchDto } from "src/dto";
import { Request } from "express";

@Controller("agent-commissions")
export class AgentCommissionController {
  constructor(private agentCommissionService: AgentCommissionService) {}

  @Get()
  onGetAgentCommissions(@Query() query: QuerySearchDto) {
    return this.agentCommissionService.agentCommissions(query);
  }

  @Patch("start/:id")
  onStartAgentCommission(
    @Param("id") id: string,
    @Body() dto: StartAgentCommissionDto,
    @Req() req: Request,
  ) {
    return this.agentCommissionService.startAgentCommission(id, dto, req.user);
  }

  @Delete("delete/:id")
  onDeleteAgentCommission(@Param("id") id: string, @Req() req: Request) {
    return this.agentCommissionService.deleteAgentCommission(id, req.user);
  }

  @Get(":id")
  onGetAgentCommission(@Param("id") id: string) {
    return this.agentCommissionService.agentCommission(id);
  }
}
