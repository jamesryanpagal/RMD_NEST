import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { RequestService } from "./request.service";
import { Request } from "express";
import { ApproveRequestDto, RejectDeleteRequestDto } from "./dto";
import { $Enums } from "generated/prisma";
import { CreateUpdateClientDto } from "src/client/dto";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { RolesGuard } from "src/services/guard/guard.service";
import { Roles } from "src/decorator";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT), RolesGuard)
@Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
@Controller("requests")
export class RequestController {
  constructor(private requestService: RequestService) {}

  @Post("approve/:requestId")
  onApproveClientUpdate(
    @Param("requestId") requestId: string,
    @Body() dto: ApproveRequestDto,
    @Req() req: Request,
  ) {
    return this.requestService.approveClientUpdate(requestId, dto, req.user);
  }

  @Post("reject/or/delete/:requestId/")
  onRejectRequest(
    @Param("requestId") requestId: string,
    @Body() dto: RejectDeleteRequestDto,
    @Req() req: Request,
  ) {
    return this.requestService.rejectOrDeleteRequest(dto, requestId, req.user);
  }

  @Patch("update/client/:requestId")
  onUpdateClientRequest(
    @Param("requestId") requestId: string,
    @Body() dto: CreateUpdateClientDto,
    @Req() req: Request,
  ) {
    return this.requestService.updateClientRequest(requestId, dto, req.user);
  }

  @Get(":module")
  onGetRequestList(
    @Param("module") module: $Enums.REQUEST_MODULE,
    @Req() req: Request,
  ) {
    return this.requestService.getRequestList(module, req.user);
  }
}
