import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { ProjectService } from "./project.service";
import { ProjectController } from "./project.controller";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import {
  DuplciatePhaseMiddleware,
  DuplicateBlockMiddleware,
  DuplicateLotMiddleware,
  DuplicateProjectMiddleware,
} from "src/middleware/project/project.middleware";
import { MtzService } from "src/services/mtz/mtz.service";

@Module({
  providers: [ProjectService, ExceptionService, PrismaService, MtzService],
  controllers: [ProjectController],
})
export class ProjectModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DuplicateProjectMiddleware).forRoutes({
      path: "projects/create",
      method: RequestMethod.POST,
    });

    consumer.apply(DuplciatePhaseMiddleware).forRoutes({
      path: "projects/add/phase/:id",
      method: RequestMethod.POST,
    });

    consumer.apply(DuplicateBlockMiddleware).forRoutes({
      path: "projects/add/block/:id",
      method: RequestMethod.POST,
    });

    consumer.apply(DuplicateLotMiddleware).forRoutes({
      path: "projects/add/lot/:id",
      method: RequestMethod.POST,
    });
  }
}
