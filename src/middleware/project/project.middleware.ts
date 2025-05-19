import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { BlockDto, CreateProjectDto, LotDto, PhaseDto } from "src/project/dto";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PrismaService } from "src/services/prisma/prisma.service";

@Injectable()
export class DuplicateProjectMiddleware implements NestMiddleware {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const { projectName } = req.body as CreateProjectDto;

    const checkExistingProject = await this.prismaService.project.findFirst({
      where: {
        projectName,
      },
    });

    if (checkExistingProject) {
      this.exceptionService.throw("Project name already exists", "BAD_REQUEST");
      return;
    }

    next();
  }
}

@Injectable()
export class DuplciatePhaseMiddleware implements NestMiddleware {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const { title } = req.body as PhaseDto;
    const { id } = req.params as any;

    const checkExistingPhase = await this.prismaService.phase.findFirst({
      where: {
        AND: [
          {
            projectId: id,
          },
          {
            title,
          },
        ],
      },
    });

    if (checkExistingPhase) {
      this.exceptionService.throw("Phase already exists", "BAD_REQUEST");
      return;
    }

    next();
  }
}

@Injectable()
export class DuplicateBlockMiddleware implements NestMiddleware {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const { title } = req.body as BlockDto;
    const { id } = req.params as any;

    const checkExistingBlock = await this.prismaService.block.findFirst({
      where: {
        AND: [
          {
            phaseId: id,
          },
          {
            title,
          },
        ],
      },
    });

    if (checkExistingBlock) {
      this.exceptionService.throw("Block already exists", "BAD_REQUEST");
      return;
    }

    next();
  }
}

@Injectable()
export class DuplicateLotMiddleware implements NestMiddleware {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const { title } = req.body as LotDto;
    const { id } = req.params as any;

    const checkExistingLot = await this.prismaService.lot.findFirst({
      where: {
        AND: [
          {
            blockId: id,
          },
          {
            title,
          },
        ],
      },
    });

    if (checkExistingLot) {
      this.exceptionService.throw("Lot already exists", "BAD_REQUEST");
      return;
    }

    next();
  }
}
