import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from "@nestjs/common";
import { AgentCommissionService } from "./agent-commission.service";
import { StartAgentCommissionDto } from "./dto";
import { QuerySearchDto } from "src/dto";

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
  ) {
    return this.agentCommissionService.startAgentCommission(id, dto);
  }

  @Delete("delete/:id")
  onDeleteAgentCommission(@Param("id") id: string) {
    return this.agentCommissionService.deleteAgentCommission(id);
  }

  @Get(":id")
  onGetAgentCommission(@Param("id") id: string) {
    return this.agentCommissionService.agentCommission(id);
  }
}
