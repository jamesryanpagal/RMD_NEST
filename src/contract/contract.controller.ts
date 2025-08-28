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
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { ContractService } from "./contract.service";
import { CreateUpdateContractDto, UpdatePaymentStartDateDto } from "./dto";
import { RolesGuard } from "src/services/guard/guard.service";
import { Roles } from "src/decorator";
import { $Enums } from "generated/prisma";
import { Request } from "express";
import { QuerySearchDto } from "src/dto";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT), RolesGuard)
@Roles($Enums.ROLE.ADMIN, $Enums.ROLE.SECRETARY)
@Controller("contracts")
export class ContractController {
  constructor(private contractService: ContractService) {}

  @Get()
  onGetContracts(@Query() query: QuerySearchDto) {
    return this.contractService.getContracts(query);
  }

  @Post("create/:clientId/:lotId/:agentId")
  onCreateContract(
    @Param("clientId") clientId: string,
    @Param("lotId") lotId: string,
    @Param("agentId") agentId: string,
    @Body() dto: CreateUpdateContractDto,
    @Req() req: Request,
  ) {
    return this.contractService.createContract(
      clientId,
      lotId,
      agentId,
      dto,
      req.user,
    );
  }

  @Get("agent/:agentId")
  onGetAgentContracts(@Param("agentId") agentId: string) {
    return this.contractService.getAgentContracts(agentId);
  }
  @Get("agent/commission/:contractId")
  onGetAgentContract(@Param("contractId") contractId: string) {
    return this.contractService.getAgentContract(contractId);
  }

  @Patch("update/payment/start/date/:id")
  onUpdateContractPaymentStartDate(
    @Param("id") id: string,
    @Body() dto: UpdatePaymentStartDateDto,
    @Req() req: Request,
  ) {
    return this.contractService.updateContractPaymentStartDate(
      id,
      dto,
      req.user,
    );
  }

  // @Patch("update/:id")
  // onUpdateContract(
  //   @Param("id") id: string,
  //   @Body() dto: CreateUpdateContractDto,
  // ) {
  //   return this.contractService.updateContract(id, dto);
  // }

  @Delete("delete/:id")
  onDeleteContract(@Param("id") id: string, @Req() req: Request) {
    return this.contractService.deleteContract(id, req.user);
  }

  @Get(":id")
  onGetContract(@Param("id") id: string) {
    return this.contractService.getContract(id);
  }
}
