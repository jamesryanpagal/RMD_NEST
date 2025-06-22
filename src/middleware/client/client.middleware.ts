import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { CreateClientServiceDto } from "src/client/dto";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PrismaService } from "src/services/prisma/prisma.service";

@Injectable()
export class ExistingClientMiddleware implements NestMiddleware {
  constructor(
    private exceptionService: ExceptionService,
    private prismaService: PrismaService,
  ) {}
  async use(req: Request, _res: Response, next: NextFunction) {
    const { email } = req.body as CreateClientServiceDto;
    const { id } = req.params as { id: string };

    const isPostRequest = req.method === "POST";

    const existingClient = await this.prismaService.client.findFirst({
      where: {
        AND: [
          {
            email,
          },
          !isPostRequest ? { id: { not: id } } : {},
          {
            status: {
              not: "DELETED",
            },
          },
        ],
      },
    });

    if (existingClient) {
      this.exceptionService.throw(
        "Client with this email already exists",
        "BAD_REQUEST",
      );
      return;
    }

    next();
  }
}
