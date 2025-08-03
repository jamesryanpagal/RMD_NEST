import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { PrismaService } from "src/services/prisma/prisma.service";

@Injectable()
export class CronService {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
    private mtzService: MtzService,
  ) {}

  private readonly logger = new Logger(CronService.name, { timestamp: true });

  @Cron(CronExpression.EVERY_10_SECONDS, { timeZone: "Asia/Manila" })
  async onSendContractPaymentReminder() {
    try {
      const contractsResponse = await this.prismaService.contract.findMany({
        where: {
          AND: [
            {
              status: "ON_GOING",
            },
            {
              paymentType: "INSTALLMENT",
            },
          ],
        },
      });

      if (!contractsResponse.length) {
        this.logger.log("No on-going installment contracts found.");
        return;
      }

      await Promise.all(
        contractsResponse.map(async ({ nextPaymentDate }) => {
          const currentDate = this.mtzService.mtz();
          const parsedNextPaymentDate = this.mtzService.mtz(
            nextPaymentDate,
            "dateTimeUTCZ",
          );

          const daysDiff = parsedNextPaymentDate.diff(currentDate, "days");
        }),
      );
    } catch (error) {
      throw error;
    }
  }
}
