import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PAYMENT_PENALTY_AMOUNT } from "src/payment/payment.service";
import { FormatterService } from "src/services/formatter/formatter.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { PrismaService } from "src/services/prisma/prisma.service";

@Injectable()
export class CronService {
  constructor(
    private prismaService: PrismaService,
    private mtzService: MtzService,
    private formatterService: FormatterService,
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
        contractsResponse.map(
          async ({
            id,
            nextPaymentDate,
            downPaymentStatus,
            totalMonthlyDown,
            totalMonthly,
          }) => {
            const currentDate = this.mtzService.mtz().startOf("day");
            const parsedNextPaymentDate = this.mtzService
              .mtz(nextPaymentDate, "dateTimeUTCZ")
              .startOf("day");

            const daysDiff = parsedNextPaymentDate.diff(currentDate, "days");

            const isInDueDate = daysDiff <= 2 && daysDiff >= 1;
            const isDueDateToday = daysDiff === 0;
            const isOverDue = daysDiff < 0;

            const totalMonthlyPaymentAmount =
              downPaymentStatus === "ON_GOING"
                ? totalMonthlyDown
                : totalMonthly;

            const formattedMonthlyPaymentAmount =
              this.formatterService.onParseToPhp(
                totalMonthlyPaymentAmount || 0,
              );

            if (isInDueDate) {
              console.log({
                id,
                message: `This is a friendly reminder that your upcoming monthly installment of ${formattedMonthlyPaymentAmount} is due in ${daysDiff} day(s). We recommend preparing your payment in advance to ensure a smooth and timely transaction.`,
              });
            } else if (isDueDateToday) {
              console.log({
                id,
                message: `This is a friendly reminder that your monthly installment of ${formattedMonthlyPaymentAmount} is due today. We recommend settling your payment as soon as possible to ensure a smooth and timely transaction.`,
              });
            } else if (isOverDue) {
              const weeksPassed = Math.trunc(Math.abs(daysDiff) / 7);
              const computedPenaltyAmount =
                weeksPassed * PAYMENT_PENALTY_AMOUNT;
              const computedTotalMonthlyPaymentAmount =
                (totalMonthlyPaymentAmount || 0) + computedPenaltyAmount;

              const formattedComputedTotalMonthlyPaymentAmount =
                this.formatterService.onParseToPhp(
                  computedTotalMonthlyPaymentAmount,
                );
              const formattedPenaltyAmount = this.formatterService.onParseToPhp(
                PAYMENT_PENALTY_AMOUNT,
              );
              const formattedComputedPenaltyAmount =
                this.formatterService.onParseToPhp(computedPenaltyAmount);

              if (!weeksPassed) {
                console.log({
                  id,
                  message: `Your monthly installment payment of ${formattedComputedTotalMonthlyPaymentAmount} is currently overdue. If payment is not made within one week, a penalty of ${formattedPenaltyAmount} will be applied. An additional ${formattedPenaltyAmount} will be added for every week the payment remains unsettled. We strongly encourage you to settle your balance as soon as possible to avoid accumulating further charges.`,
                });
              } else {
                console.log({
                  id,
                  message: `Your monthly installment payment has been overdue for over ${weeksPassed} weeks. A penalty of ${formattedComputedPenaltyAmount} has been applied, bringing your total due to ${formattedComputedTotalMonthlyPaymentAmount}. We strongly encourage you to settle this as soon as possible to prevent further charges.`,
                });
              }
            }
          },
        ),
      );
    } catch (error) {
      throw error;
    }
  }
}
