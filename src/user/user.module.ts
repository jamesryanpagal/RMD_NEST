import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { ArgonService } from "src/services/argon/argon.service";

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, ExceptionService, ArgonService],
})
export class UserModule {}
