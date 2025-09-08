import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { JwtGlobalConfig } from "./config";
import { ProjectModule } from "./project/project.module";
import { ClientModule } from "./client/client.module";
import { ContractModule } from "./contract/contract.module";
import { PaymentModule } from "./payment/payment.module";
import { ReservationModule } from "./reservation/reservation.module";
import { AgentModule } from "./agent/agent.module";
import { AgentCommissionModule } from "./agent-commission/agent-commission.module";
import { FileModule } from "./file/file.module";
// import { CronModule } from "./cron/cron.module";
import { EmailModule } from "./email/email.module";
import { RequestModule } from "./request/request.module";
import { AuditModule } from "./audit/audit.module";
import { CronModule } from "./cron/cron.module";

@Module({
  imports: [
    AuthModule,
    UserModule,
    ProjectModule,
    JwtGlobalConfig,
    ClientModule,
    ContractModule,
    PaymentModule,
    ReservationModule,
    AgentModule,
    AgentCommissionModule,
    FileModule,
    EmailModule,
    RequestModule,
    AuditModule,
    CronModule,
  ],
})
export class AppModule {}
