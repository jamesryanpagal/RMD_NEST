import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { ContractService } from "./contract.service";
import { CreateContractDto } from "./dto";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT))
@Controller("contract")
export class ContractController {
  constructor(private contractService: ContractService) {}

  @Post("create/:clientId/:lotId")
  onCreateContract(
    @Param("clientId") clientId: string,
    @Param("lotId") lotId: string,
    @Body() dto: CreateContractDto,
  ) {
    return this.contractService.createContract(clientId, lotId, dto);
  }
}
