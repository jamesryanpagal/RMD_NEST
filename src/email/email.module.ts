import { Module } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { MessagingService } from "src/services/messaging/messaging.service";

@Module({
  controllers: [EmailController],
  providers: [
    EmailService,
    PrismaService,
    MtzService,
    ExceptionService,
    MessagingService,
  ],
})
export class EmailModule {}
