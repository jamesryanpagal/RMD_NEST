import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { ArgonService } from "src/services/argon/argon.service";
import { AuthService } from "src/auth/auth.service";
import { JwtAuthService } from "src/services/jwt/jwt.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { GeneratorService } from "src/services/generator/generator.service";
import { MessagingService } from "src/services/messaging/messaging.service";

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    ExceptionService,
    ArgonService,
    AuthService,
    JwtAuthService,
    MtzService,
    GeneratorService,
    MessagingService,
  ],
})
export class UserModule {}
