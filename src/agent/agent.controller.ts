import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { AgentService } from "./agent.service";
import { AgentDto } from "./dto";

@Controller("agents")
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Get()
  onGetAgents() {
    return this.agentService.getAgents();
  }

  @Post("create")
  onCreateAgent(@Body() dto: AgentDto) {
    return this.agentService.createAgent(dto);
  }

  @Patch("update/:id")
  onUpdateAgent(@Body() dto: AgentDto, @Param("id") id: string) {
    return this.agentService.updateAgent(id, dto);
  }

  @Delete("delete/:id")
  onDeleteAgent(@Param("id") id: string) {
    return this.agentService.deleteAgent(id);
  }

  @Get(":id")
  onGetAgent(@Param("id") id: string) {
    return this.agentService.getAgent(id);
  }
}
