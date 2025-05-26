import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { JwtGlobalConfig } from "./config";
import { PrismaService } from "./services/prisma/prisma.service";
import { ProjectModule } from "./project/project.module";
import { ClientModule } from "./client/client.module";
import { ContractModule } from './contract/contract.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ProjectModule,
    JwtGlobalConfig,
    ClientModule,
    ContractModule,
    PaymentModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
