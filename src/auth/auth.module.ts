import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ArgonService } from "src/services/argon/argon.service";
import {
  LoginMiddleware,
  SignupMiddleware,
} from "src/middleware/auth/auth.middleware";
import { JwtAuthService } from "src/services/jwt/jwt.service";
import { MtzService } from "src/services/mtz/mtz.service";
import {
  JwtStrategyService,
  RefreshJwtStrategyService,
} from "src/services/strategy/strategy.service";

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    ExceptionService,
    PrismaService,
    ArgonService,
    JwtAuthService,
    MtzService,
    JwtStrategyService,
    RefreshJwtStrategyService,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoginMiddleware)
      .forRoutes({ path: "auth/login", method: RequestMethod.POST });

    consumer.apply(SignupMiddleware).forRoutes({
      path: "auth/create/account",
      method: RequestMethod.POST,
    });
  }
}
