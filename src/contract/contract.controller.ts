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
import { AuthGuard } from "@nestjs/passport";
import { PASSPORT_STRATEGY_KEY } from "src/services/strategy/strategy.service";
import { ContractService } from "./contract.service";
import { CreateUpdateContractDto } from "./dto";

@UseGuards(AuthGuard(PASSPORT_STRATEGY_KEY.JWT))
@Controller("contracts")
export class ContractController {
  constructor(private contractService: ContractService) {}

  @Get()
  onGetContracts() {
    return this.contractService.getContracts();
  }

  @Post("create/:clientId/:lotId/:agentId")
  onCreateContract(
    @Param("clientId") clientId: string,
    @Param("lotId") lotId: string,
    @Param("agentId") agentId: string,
    @Body() dto: CreateUpdateContractDto,
  ) {
    return this.contractService.createContract(clientId, lotId, agentId, dto);
  }

  // @Patch("update/:id")
  // onUpdateContract(
  //   @Param("id") id: string,
  //   @Body() dto: CreateUpdateContractDto,
  // ) {
  //   return this.contractService.updateContract(id, dto);
  // }

  @Delete("delete/:id")
  onDeleteContract(@Param("id") id: string) {
    return this.contractService.deleteContract(id);
  }

  @Get(":id")
  onGetContract(@Param("id") id: string) {
    return this.contractService.getContract(id);
  }
}
