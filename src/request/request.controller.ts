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
@Controller("requests")
export class RequestController {
  constructor(private requestService: RequestService) {}

  @Roles($Enums.ROLE.ADMIN)
  @Post("approve/:requestId")
  onApproveRequest(
    @Param("requestId") requestId: string,
    @Body() dto: ApproveRequestDto,
    @Req() req: Request,
  ) {
    return this.requestService.approveRequest(requestId, dto, req.user);
  }

  @Roles($Enums.ROLE.ADMIN)
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

  // ? create request update for request model

  @Get(":module")
  onGetRequestList(
    @Param("module") module: $Enums.REQUEST_MODULE,
    @Req() req: Request,
  ) {
    return this.requestService.getRequestList(module, req.user);
  }
}
