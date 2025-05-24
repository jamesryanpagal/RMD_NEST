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
import { ProjectService } from "./project.service";
import {
  BlockDto,
  CreateProjectDto,
  LotDto,
  PhaseDto,
  UpdateBlockDto,
  UpdateLotDto,
  UpdatePhaseDto,
  UpdateProjectDto,
} from "./dto";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT))
@Controller("projects")
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Get()
  onGetProjects() {
    return this.projectService.getProjects();
  }

  @Post("create")
  onCreateProject(@Body() dto: CreateProjectDto) {
    return this.projectService.createProject(dto);
  }

  @Patch("update/:id")
  onUpdateProject(@Body() dto: UpdateProjectDto, @Param("id") id: string) {
    return this.projectService.updateProject(dto, id);
  }

  @Delete("delete/:id")
  onDeleteProject(@Param("id") id: string) {
    return this.projectService.deleteProject(id);
  }

  @Post("add/phase/:id") // ? id represents the projectId
  onAddPhase(@Param("id") id: string, @Body() dto: PhaseDto) {
    return this.projectService.addPhase(id, dto);
  }

  @Patch("update/phase/:id")
  onUpdatePhase(@Param("id") id: string, @Body() dto: UpdatePhaseDto) {
    return this.projectService.updatePhase(id, dto);
  }

  @Get("get/phase/:id")
  onGetPhase(@Param("id") id: string) {
    return this.projectService.getPhase(id);
  }

  @Delete("delete/phase/:id")
  onDeletePhase(@Param("id") id: string) {
    return this.projectService.deletePhase(id);
  }

  @Post("add/block/:id") // ? id represents the phaseId
  onAddBlock(@Param("id") id: string, @Body() dto: BlockDto) {
    return this.projectService.addBlock(id, dto);
  }

  @Patch("update/block/:id")
  onUpdateBlock(@Param("id") id: string, @Body() dto: UpdateBlockDto) {
    return this.projectService.updateBlock(id, dto);
  }

  @Get("get/block/:id")
  onGetBlock(@Param("id") id: string) {
    return this.projectService.getBlock(id);
  }

  @Delete("delete/block/:id")
  onDeleteBlock(@Param("id") id: string) {
    return this.projectService.deleteBlock(id);
  }

  @Post("add/lot/:id") // ? id represents the blockId
  onAddLot(@Param("id") id: string, @Body() dto: LotDto) {
    return this.projectService.addLot(id, dto);
  }

  @Patch("update/lot/:id")
  onUpdateLot(@Param("id") id: string, @Body() dto: UpdateLotDto) {
    return this.projectService.updateLot(id, dto);
  }

  @Get("get/lot/:id")
  onGetLot(@Param("id") id: string) {
    return this.projectService.getLot(id);
  }

  @Delete("delete/lot/:id")
  onDeleteLot(@Param("id") id: string) {
    return this.projectService.deleteLot(id);
  }

  @Get(":id")
  onGetProject(@Param("id") id: string) {
    return this.projectService.getProject(id);
  }
}
