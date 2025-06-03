import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { CreateUpdateContractDto } from "src/contract/dto";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PrismaService } from "src/services/prisma/prisma.service";

@Injectable()
export class ContractMiddleware implements NestMiddleware {
  constructor(
    private exceptionService: ExceptionService,
    private prismaService: PrismaService,
  ) {}
  async use(req: Request, _res: Response, next: NextFunction) {
    const { clientId, lotId } = req.params as {
      clientId: string;
      lotId: string;
      agentId: string;
    };

    const checkExistingContract = await this.prismaService.contract.findFirst({
      where: {
        AND: [
          {
            clientId,
          },
          {
            lotId,
          },
          {
            status: { not: "DELETED" },
          },
        ],
      },
    });

    if (!!checkExistingContract) {
      this.exceptionService.throw(
        "Contract already exists for this client and lot",
        "BAD_REQUEST",
      );
      return;
    }

    next();
  }
}
