import { Controller, Get, Param, ParseEnumPipe } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { $Enums } from "generated/prisma";

@Controller("audit")
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get(":module")
  onGetAudit(
    @Param("module", new ParseEnumPipe($Enums.MODULES)) module: $Enums.MODULES,
  ) {
    return this.auditService.audit(module);
  }
}
