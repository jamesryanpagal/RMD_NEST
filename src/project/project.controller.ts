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
import { RolesGuard } from "src/services/guard/guard.service";
import { Roles } from "src/decorator";
import { $Enums } from "generated/prisma";
import { Request } from "express";
import { QuerySearchDto } from "src/dto";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT), RolesGuard)
@Controller("projects")
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
  @Get()
  onGetProjects(@Query() query: QuerySearchDto) {
    return this.projectService.getProjects(query);
  }

  @Roles($Enums.ROLE.ADMIN)
  @Post("create")
  onCreateProject(@Body() dto: CreateProjectDto, @Req() req: Request) {
    return this.projectService.createProject(dto, req.user);
  }

  @Roles($Enums.ROLE.ADMIN)
  @Patch("update/:id")
  onUpdateProject(
    @Body() dto: UpdateProjectDto,
    @Param("id") id: string,
    @Req() req: Request,
  ) {
    return this.projectService.updateProject(dto, id, req.user);
  }

  @Roles($Enums.ROLE.ADMIN)
  @Delete("delete/:id")
  onDeleteProject(@Param("id") id: string, @Req() req: Request) {
    return this.projectService.deleteProject(id, req.user);
  }

  @Roles($Enums.ROLE.ADMIN)
  @Post("add/phase/:id") // ? id represents the projectId
  onAddPhase(
    @Param("id") id: string,
    @Body() dto: PhaseDto,
    @Req() req: Request,
  ) {
    return this.projectService.addPhase(id, dto, req.user);
  }

  @Roles($Enums.ROLE.ADMIN)
  @Patch("update/phase/:projectId/:id")
  onUpdatePhase(
    @Param("projectId") projectId: string,
    @Param("id") id: string,
    @Body() dto: UpdatePhaseDto,
    @Req() req: Request,
  ) {
    return this.projectService.updatePhase(projectId, id, dto, req.user);
  }

  // ? continue applying the req.user for audit trail

  @Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
  @Get("get/phase/:id")
  onGetPhase(@Param("id") id: string) {
    return this.projectService.getPhase(id);
  }

  @Roles($Enums.ROLE.ADMIN)
  @Delete("delete/phase/:id")
  onDeletePhase(@Param("id") id: string) {
    return this.projectService.deletePhase(id);
  }

  @Roles($Enums.ROLE.ADMIN)
  @Post("add/block/:id") // ? id represents the phaseId
  onAddBlock(@Param("id") id: string, @Body() dto: BlockDto) {
    return this.projectService.addBlock(id, dto);
  }

  @Roles($Enums.ROLE.ADMIN)
  @Patch("update/block/:id")
  onUpdateBlock(@Param("id") id: string, @Body() dto: UpdateBlockDto) {
    return this.projectService.updateBlock(id, dto);
  }

  @Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
  @Get("get/block/:id")
  onGetBlock(@Param("id") id: string) {
    return this.projectService.getBlock(id);
  }

  @Roles($Enums.ROLE.ADMIN)
  @Delete("delete/block/:id")
  onDeleteBlock(@Param("id") id: string) {
    return this.projectService.deleteBlock(id);
  }

  @Roles($Enums.ROLE.ADMIN)
  @Post("add/lot/:id") // ? id represents the blockId
  onAddLot(@Param("id") id: string, @Body() dto: LotDto) {
    return this.projectService.addLot(id, dto);
  }

  @Roles($Enums.ROLE.ADMIN)
  @Patch("update/lot/:id")
  onUpdateLot(@Param("id") id: string, @Body() dto: UpdateLotDto) {
    return this.projectService.updateLot(id, dto);
  }

  @Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
  @Get("get/lot/:id")
  onGetLot(@Param("id") id: string) {
    return this.projectService.getLot(id);
  }

  @Roles($Enums.ROLE.ADMIN)
  @Delete("delete/lot/:id")
  onDeleteLot(@Param("id") id: string) {
    return this.projectService.deleteLot(id);
  }

  @Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
  @Get(":id")
  onGetProject(@Param("id") id: string) {
    return this.projectService.getProject(id);
  }
}
