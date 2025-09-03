import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PAYMENT_PENALTY_AMOUNT } from "src/payment/payment.service";
import { ReservationService } from "src/reservation/reservation.service";
import { FormatterService } from "src/services/formatter/formatter.service";
import { MessagingService } from "src/services/messaging/messaging.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { PrismaService } from "src/services/prisma/prisma.service";

@Injectable()
export class CronService {
  constructor(
    private prismaService: PrismaService,
    private mtzService: MtzService,
    private formatterService: FormatterService,
    private reservationService: ReservationService,
    private messagingService: MessagingService,
  ) {}

  private readonly logger = new Logger(CronService.name, { timestamp: true });

  @Cron(CronExpression.EVERY_DAY_AT_10AM, { timeZone: "Asia/Manila" })
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
        include: {
          client: true,
        },
      });

      if (!contractsResponse.length) {
        this.logger.log("No on-going installment contracts found.");
        return;
      }

      this.logger.log("Validating contracts due...");
      await Promise.all(
        contractsResponse.map(
          async ({
            id,
            nextPaymentDate,
            downPaymentStatus,
            totalMonthlyDown,
            totalMonthly,
            client,
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

            if (!client) return;
            const { email } = client;

            if (isInDueDate) {
              await this.messagingService.onSendPaymentReminderInDueDate({
                email,
                amount: formattedMonthlyPaymentAmount,
                dueDate: daysDiff,
              });
            } else if (isDueDateToday) {
              await this.messagingService.onSendPaymentReminderTodayDueDate({
                email,
                amount: formattedMonthlyPaymentAmount,
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
                await this.messagingService.onSendPaymentReminderOverDueDate({
                  email,
                  amount: formattedComputedTotalMonthlyPaymentAmount,
                  penalty: formattedPenaltyAmount,
                });
              } else {
                await this.messagingService.onSendPaymentReminderOverDueDateWeekPast(
                  {
                    email,
                    amount: formattedComputedTotalMonthlyPaymentAmount,
                    weeksPassed,
                    penalty: formattedComputedPenaltyAmount,
                  },
                );
              }
            }
          },
        ),
      );
      this.logger.log("Contracts due validated.");
    } catch (error) {
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM, { timeZone: "Asia/Manila" })
  async onCheckReservationValidity() {
    try {
      await this.prismaService.$transaction(async prisma => {
        const reservationsResponse = await prisma.reservation.findMany({
          where: {
            status: "ACTIVE",
          },
        });

        if (!reservationsResponse.length) {
          this.logger.log("No active reservations found.");
          return;
        }

        this.logger.log("Checking reservation validity...");

        await Promise.all(
          reservationsResponse.map(async props => {
            await this.reservationService.onValidateReservationValidity(
              props,
              prisma,
            );
          }),
        );

        this.logger.log("Checking reservation validity completed.");
      });
    } catch (error) {
      throw error;
    }
  }
}
