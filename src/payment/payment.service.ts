import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import { CreateUpdatePaymentDto, PaymentBreakdownType } from "./dto";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { FormatterService } from "src/services/formatter/formatter.service";

@Injectable()
export class PaymentService {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
    private mtzService: MtzService,
    private formatterService: FormatterService,
  ) {}

  async getPayments() {
    try {
      return this.prismaService.payment.findMany({
        where: {
          status: { not: "DELETED" },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async createContractPayment(contractId: string, dto: CreateUpdatePaymentDto) {
    const {
      modeOfPayment,
      paymentDate,
      amount,
      referenceNumber,
      transactionType,
    } = dto || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        const contractResponse = await prisma.contract.findFirst({
          where: {
            AND: [
              {
                id: contractId,
              },
              {
                status: { not: "DELETED" },
              },
            ],
          },
        });

        if (!contractResponse) {
          this.exceptionService.throw("Contract not found", "NOT_FOUND");
          return;
        }

        const {
          paymentType,
          downPaymentStatus,
          downPaymentType,
          totalMonthlyDown,
          totalDownPaymentBalance,
          totalMonthly,
          status,
          balance,
          nextPaymentDate,
          paymentStartedDate,
          paymentLastDate,
          recurringPaymentDay,
          excessPayment,
        } = contractResponse || {};

        if (paymentType === "INSTALLMENT") {
          if (
            downPaymentType === "PARTIAL_DOWN_PAYMENT" &&
            downPaymentStatus === "ON_GOING" &&
            totalMonthlyDown &&
            totalDownPaymentBalance
          ) {
            if (amount < totalMonthlyDown) {
              this.exceptionService.throw(
                `Amount must be greater than or equal to ${totalMonthlyDown}`,
                "BAD_REQUEST",
              );
              return;
            }

            const totalExcessPayment = Number(
              (amount - totalMonthlyDown).toFixed(2),
            );

            const computedExcessPayment =
              amount > totalMonthlyDown
                ? excessPayment + totalExcessPayment
                : 0;

            if (transactionType !== "PARTIAL_DOWN_PAYMENT") {
              this.exceptionService.throw(
                "Payment must be for PARTIAL_DOWN_PAYMENT on this transaction",
                "BAD_REQUEST",
              );
              return;
            }

            const baseDate =
              nextPaymentDate && recurringPaymentDay
                ? this.mtzService
                    .mtz(nextPaymentDate)
                    .set("date", recurringPaymentDay)
                : this.mtzService.mtz();

            const installmentNextPaymentDate = baseDate
              .add(1, "month")
              .toDate();

            const totalDownPaymentBalanceAfterAmount =
              totalDownPaymentBalance - amount - totalExcessPayment;

            const isDownPaymentBalanceZero =
              totalDownPaymentBalanceAfterAmount <= 0;

            await prisma.payment.create({
              data: {
                modeOfPayment,
                paymentDate,
                amount,
                referenceNumber,
                targetDueDate: nextPaymentDate,
                transactionType,
                contract: {
                  connect: {
                    id: contractId,
                  },
                },
              },
            });

            await prisma.contract.update({
              where: {
                id: contractId,
              },
              data: {
                nextPaymentDate: installmentNextPaymentDate,
                excessPayment: computedExcessPayment,
                ...(!paymentStartedDate
                  ? {
                      paymentStartedDate: this.mtzService
                        .mtz(undefined, "dateTimeUTCZ")
                        .toISOString(),
                    }
                  : {}),
                ...(isDownPaymentBalanceZero
                  ? {
                      totalDownPaymentBalance: 0,
                      downPaymentStatus: "DONE",
                    }
                  : {
                      totalDownPaymentBalance:
                        totalDownPaymentBalanceAfterAmount,
                    }),
              },
            });
          } else if (
            downPaymentType === "FULL_DOWN_PAYMENT" &&
            downPaymentStatus === "ON_GOING" &&
            totalDownPaymentBalance
          ) {
            if (amount < totalDownPaymentBalance) {
              this.exceptionService.throw(
                `Amount must be greater than or equal to ${totalDownPaymentBalance}`,
                "BAD_REQUEST",
              );
              return;
            }

            if (transactionType !== "FULL_DOWN_PAYMENT") {
              this.exceptionService.throw(
                "Payment must be for FULL_DOWN_PAYMENT on this transaction",
                "BAD_REQUEST",
              );
              return;
            }

            const totalExcessPayment = Number(
              (amount - totalDownPaymentBalance).toFixed(2),
            );

            const computedExcessPayment =
              amount > totalDownPaymentBalance
                ? excessPayment + totalExcessPayment
                : 0;

            const baseDate =
              nextPaymentDate && recurringPaymentDay
                ? this.mtzService
                    .mtz(nextPaymentDate)
                    .set("date", recurringPaymentDay)
                : this.mtzService.mtz();

            const installmentNextPaymentDate = baseDate
              .add(1, "month")
              .toDate();

            await prisma.payment.create({
              data: {
                modeOfPayment,
                paymentDate,
                amount,
                referenceNumber,
                transactionType,
                targetDueDate: nextPaymentDate,
                contract: {
                  connect: {
                    id: contractId,
                  },
                },
              },
            });

            await prisma.contract.update({
              where: {
                id: contractId,
              },
              data: {
                nextPaymentDate: installmentNextPaymentDate,
                totalDownPaymentBalance: 0,
                downPaymentStatus: "DONE",
                excessPayment: computedExcessPayment,
                ...(!paymentStartedDate
                  ? {
                      paymentStartedDate: this.mtzService
                        .mtz(undefined, "dateTimeUTCZ")
                        .toISOString(),
                    }
                  : {}),
              },
            });
          } else if (
            downPaymentStatus === "DONE" &&
            status === "ON_GOING" &&
            totalMonthly
          ) {
            if (transactionType !== "MONTHLY_PAYMENT") {
              this.exceptionService.throw(
                "Payment must be for MONTHLY_PAYMENT on this transaction",
                "BAD_REQUEST",
              );
              return;
            }

            const parsedNextPaymentDate = this.mtzService
              .mtz(nextPaymentDate, "dateTimeUTCZ")
              .format(this.mtzService.dateFormat.defaultformat);
            const parsedLastPaymentDate = this.mtzService
              .mtz(paymentLastDate, "dateTimeUTCZ")
              .format(this.mtzService.dateFormat.defaultformat);

            const isLastPaymentDate =
              parsedNextPaymentDate === parsedLastPaymentDate;

            if (isLastPaymentDate && amount < totalMonthly - excessPayment) {
              this.exceptionService.throw(
                `Amount must be greater than or equal to ${totalMonthly - excessPayment}`,
                "BAD_REQUEST",
              );
              return;
            }

            if (amount < totalMonthly) {
              this.exceptionService.throw(
                `Amount must be greater than or equal to ${totalMonthly}`,
                "BAD_REQUEST",
              );
              return;
            }

            const totalExcessPayment = Number(
              (amount - totalMonthly).toFixed(2),
            );

            const computedExcessPayment =
              amount > totalMonthly ? excessPayment + totalExcessPayment : 0;

            const baseDate =
              nextPaymentDate && recurringPaymentDay
                ? this.mtzService
                    .mtz(nextPaymentDate)
                    .set("date", recurringPaymentDay)
                : this.mtzService.mtz();

            const installmentNextPaymentDate = baseDate
              .add(1, "month")
              .toDate();

            const computedBalance = balance - amount - totalExcessPayment;
            const totalBalanceAfterAmount =
              computedBalance <= 0 ? 0 : computedBalance;

            await prisma.payment.create({
              data: {
                modeOfPayment,
                paymentDate,
                amount,
                referenceNumber,
                targetDueDate: nextPaymentDate,
                transactionType,
                contract: {
                  connect: {
                    id: contractId,
                  },
                },
              },
            });

            await prisma.contract.update({
              where: {
                id: contractId,
              },
              data: {
                balance: totalBalanceAfterAmount,
                nextPaymentDate: installmentNextPaymentDate,
                ...(!totalBalanceAfterAmount
                  ? { status: "DONE" }
                  : { excessPayment: computedExcessPayment }),
                ...(!paymentStartedDate
                  ? {
                      paymentStartedDate: this.mtzService
                        .mtz(undefined, "dateTimeUTCZ")
                        .toISOString(),
                    }
                  : {}),
              },
            });

            if (!totalBalanceAfterAmount) {
              await prisma.lot.update({
                where: {
                  id: contractResponse.lotId,
                },
                data: {
                  status: "SOLD",
                },
              });
            }
          } else {
            this.exceptionService.throw(
              "There's nothing to pay for this contract",
              "BAD_REQUEST",
            );
          }

          return;
        }

        if (paymentType === "CASH") {
          if (transactionType !== "TCP_FULL_PAYMENT") {
            this.exceptionService.throw(
              "Transaction type must be TCP_FULL_PAYMENT",
              "BAD_REQUEST",
            );
            return;
          }
          if (amount < balance) {
            this.exceptionService.throw(
              `Amount must be greater than or equal to ${balance}`,
              "BAD_REQUEST",
            );
            return;
          }

          await prisma.payment.create({
            data: {
              modeOfPayment,
              paymentDate,
              amount,
              referenceNumber,
              transactionType,
              contract: {
                connect: {
                  id: contractId,
                },
              },
            },
          });

          await prisma.contract.update({
            where: {
              id: contractId,
            },
            data: {
              balance: 0,
              status: "DONE",
              ...(!paymentStartedDate
                ? {
                    paymentStartedDate: this.mtzService
                      .mtz(undefined, "dateTimeUTCZ")
                      .toISOString(),
                  }
                : {}),
            },
          });

          await prisma.lot.update({
            where: {
              id: contractResponse.lotId,
            },
            data: {
              status: "SOLD",
            },
          });
        }
      });

      return "Payment created successfully";
    } catch (error) {
      throw error;
    }
  }

  async updatePayment(id: string, dto: CreateUpdatePaymentDto) {
    const { modeOfPayment, paymentDate, amount, referenceNumber } = dto || {};
    try {
      await this.prismaService.payment.update({
        where: {
          id,
        },
        data: {
          modeOfPayment,
          paymentDate,
          amount,
          referenceNumber,
        },
      });

      return "Payment updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async deletePayment(id: string) {
    try {
      await this.prismaService.payment.update({
        where: {
          id,
        },
        data: {
          status: "DELETED",
        },
      });

      return "Payment deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  async getPayment(id: string) {
    try {
      return await this.prismaService.payment.findFirst({
        where: {
          AND: [
            {
              id,
            },
            {
              status: { not: "DELETED" },
            },
          ],
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getPaymentBreakdown(contractId: string) {
    let response: any | null = null;
    try {
      await this.prismaService.$transaction(async prisma => {
        const contractResponse = await prisma.contract.findFirst({
          where: {
            AND: [
              {
                id: contractId,
              },
              {
                status: { not: "DELETED" },
              },
              {
                paymentType: "INSTALLMENT",
              },
            ],
          },
          include: {
            payment: true,
            client: {
              omit: {
                dateCreated: true,
                dateUpdated: true,
                dateDeleted: true,
              },
            },
            lot: {
              omit: {
                dateCreated: true,
                dateUpdated: true,
                dateDeleted: true,
              },
              include: {
                block: {
                  omit: {
                    dateCreated: true,
                    dateUpdated: true,
                    dateDeleted: true,
                  },
                  include: {
                    phase: {
                      omit: {
                        dateCreated: true,
                        dateUpdated: true,
                        dateDeleted: true,
                      },
                      include: {
                        project: {
                          omit: {
                            dateCreated: true,
                            dateUpdated: true,
                            dateDeleted: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!contractResponse) {
          this.exceptionService.throw("Contract not found", "NOT_FOUND");
          return;
        }

        const {
          clientId,
          lotId,
          downPaymentTerms,
          totalMonthlyDown,
          totalMonthly,
          tcp,
          downPaymentType,
          paymentType,
          paymentStartedDate,
          terms,
          payment,
          lot,
          client,
          sqmPrice,
          totalDownPayment,
          miscellaneous,
          miscellaneousTotal,
          excessPayment,
        } = contractResponse || {};

        const projectResponse = lot?.block.phase.project || {};
        const { project, ...phaseResponse } = lot?.block.phase || {};
        const { phase, ...blockResponse } = lot?.block || {};
        const { block, ...lotResponse } = lot || {};

        const reservationFee = await prisma.reservation.findFirst({
          where: {
            AND: [
              {
                clientId,
              },
              {
                lotId,
              },
              {
                status: { in: ["ACTIVE", "DONE"] },
              },
            ],
          },
          include: {
            payment: true,
          },
        });

        if (paymentType === "INSTALLMENT") {
          if (
            downPaymentType === "PARTIAL_DOWN_PAYMENT" &&
            downPaymentTerms &&
            terms &&
            totalMonthlyDown &&
            totalMonthly &&
            paymentStartedDate
          ) {
            const parsedPaymentStartedDate = this.mtzService
              .mtz(paymentStartedDate, "dateTimeUTCZ")
              .format(this.mtzService.dateFormat.dateAbbrev);

            const downPaymentBreakdown: PaymentBreakdownType[] = [];

            if (!!reservationFee && !!reservationFee.payment) {
              const { dateCreated, payment: reservationPayment } =
                reservationFee;

              const reservationPaymentDate = this.mtzService
                .mtz(dateCreated, "dateTimeUTCZ")
                .format(this.mtzService.dateFormat.dateAbbrev);

              downPaymentBreakdown.push({
                dueDate: reservationPaymentDate,
                amount: reservationPayment.amount,
                paidAmount: reservationPayment.amount,
                remainingBalance: tcp - reservationPayment.amount,
                transactionType: reservationPayment.transactionType,
                paid: true,
              });
            }

            for (let i = 0; i < downPaymentTerms; i++) {
              const {
                dueDate: previousDueDate,
                transactionType,
                remainingBalance,
              } = downPaymentBreakdown[i];

              const dueDate =
                transactionType === "RESERVATION_FEE"
                  ? this.mtzService
                      .mtz(parsedPaymentStartedDate, "dateAbbrev")
                      .format(this.mtzService.dateFormat.dateAbbrev)
                  : this.mtzService
                      .mtz(previousDueDate, "dateAbbrev")
                      .add(1, "month")
                      .format(this.mtzService.dateFormat.dateAbbrev);

              const paymentInDate = payment.find(paymentObj => {
                const formattedPaymentDate = this.mtzService
                  .mtz(paymentObj.targetDueDate, "dateTimeUTCZ")
                  .format(this.mtzService.dateFormat.dateAbbrev);

                return formattedPaymentDate === dueDate;
              });

              downPaymentBreakdown.push({
                dueDate,
                amount: totalMonthlyDown,
                paidAmount: paymentInDate?.amount || 0,
                remainingBalance: remainingBalance - totalMonthlyDown,
                transactionType: "PARTIAL_DOWN_PAYMENT",
                paid: !!paymentInDate,
              });
            }

            const totalPaymentBreakdown: PaymentBreakdownType[] = [
              ...downPaymentBreakdown,
            ];

            for (
              let i = totalPaymentBreakdown.length - 1;
              i < downPaymentBreakdown.length - 1 + terms;
              i++
            ) {
              const { dueDate: previousDueDate, remainingBalance } =
                totalPaymentBreakdown[i] || {};

              const dueDate = this.mtzService
                .mtz(previousDueDate, "dateAbbrev")
                .add(1, "month")
                .format(this.mtzService.dateFormat.dateAbbrev);

              const paymentInDate = payment.find(paymentObj => {
                const formattedPaymentDate = this.mtzService
                  .mtz(paymentObj.targetDueDate, "dateTimeUTCZ")
                  .format(this.mtzService.dateFormat.dateAbbrev);

                return formattedPaymentDate === dueDate;
              });

              totalPaymentBreakdown.push({
                dueDate,
                amount: totalMonthly,
                paidAmount: paymentInDate?.amount || 0,
                remainingBalance: remainingBalance - totalMonthly,
                transactionType: "MONTHLY_PAYMENT",
                paid: !!paymentInDate,
              });
            }

            response = {
              client,
              project: projectResponse,
              phase: phaseResponse,
              block: blockResponse,
              lot: lotResponse,
              sqm: lot?.sqm,
              sqmPrice,
              miscellaneous,
              miscellaneousTotal,
              totalDownPayment,
              tcp,
              excessPayment,
              paymentBreakdown: totalPaymentBreakdown.map(
                ({ remainingBalance, ...rest }) => ({
                  ...rest,
                  remainingBalance: this.formatterService.onParseToPhp(
                    this.formatterService.onTruncateNumber(remainingBalance),
                  ),
                }),
              ),
            };
          }
        } else {
          response = {};
        }
      });

      return response;
    } catch (error) {
      throw error;
    }
  }
}
