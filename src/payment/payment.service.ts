import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import { CreateUpdatePaymentDto, PaymentBreakdownType } from "./dto";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { FormatterService } from "src/services/formatter/formatter.service";
import { Prisma } from "generated/prisma";
import { UploadService } from "src/services/upload/upload.service";
import { FileService } from "src/file/file.service";

const PAYMENT_PENALTY_AMOUNT = 200;

@Injectable()
export class PaymentService {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
    private mtzService: MtzService,
    private formatterService: FormatterService,
    private uploadService: UploadService,
    private fileService: FileService,
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
          penaltyAmount,
        } = contractResponse || {};

        if (paymentType === "INSTALLMENT") {
          if (
            downPaymentType === "PARTIAL_DOWN_PAYMENT" &&
            downPaymentStatus === "ON_GOING" &&
            totalMonthlyDown &&
            totalDownPaymentBalance
          ) {
            const totalPayment = totalMonthlyDown + penaltyAmount;

            if (amount < totalPayment) {
              this.exceptionService.throw(
                `Amount must be greater than or equal to ${totalPayment}`,
                "BAD_REQUEST",
              );
              return;
            }

            if (transactionType !== "PARTIAL_DOWN_PAYMENT") {
              this.exceptionService.throw(
                "Payment must be for PARTIAL_DOWN_PAYMENT on this transaction",
                "BAD_REQUEST",
              );
              return;
            }

            const hasExcessPayment = amount > totalPayment;

            let totalExcessPayment = 0;
            let computedExcessPayment = excessPayment;

            if (hasExcessPayment) {
              totalExcessPayment = Number((amount - totalPayment).toFixed(2));
              computedExcessPayment += totalExcessPayment;
            }

            const baseDate =
              nextPaymentDate && recurringPaymentDay
                ? this.mtzService
                    .mtz(nextPaymentDate, "dateTimeUTCZ")
                    .add(1, "month")
                    .set("date", recurringPaymentDay)
                : this.mtzService.mtz();

            const installmentNextPaymentDate = baseDate.format(
              this.mtzService.dateFormat.dateTimeUTCZ,
            );

            const totalDownPaymentBalanceAfterAmount =
              totalDownPaymentBalance - totalMonthlyDown;

            const isDownPaymentBalanceZero =
              Math.trunc(totalDownPaymentBalanceAfterAmount) <= 0;

            await prisma.payment.create({
              data: {
                modeOfPayment,
                paymentDate,
                amount,
                referenceNumber,
                ...(!!penaltyAmount && {
                  penalized: true,
                  penaltyAmount,
                }),
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
                penaltyAmount: 0,
                penaltyCount: 0,
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

            const hasExcessPayment = amount > totalDownPaymentBalance;

            let totalExcessPayment = 0;
            let computedExcessPayment = excessPayment;

            if (hasExcessPayment) {
              totalExcessPayment = Number(
                (amount - totalDownPaymentBalance).toFixed(2),
              );
              computedExcessPayment += totalExcessPayment;
            }

            const baseDate =
              nextPaymentDate && recurringPaymentDay
                ? this.mtzService
                    .mtz(nextPaymentDate)
                    .add(1, "month")
                    .set("date", recurringPaymentDay)
                : this.mtzService.mtz();

            const installmentNextPaymentDate = baseDate.format(
              this.mtzService.dateFormat.dateTimeUTCZ,
            );

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

            const computedAmount = isLastPaymentDate
              ? totalMonthly + penaltyAmount - excessPayment
              : totalMonthly + penaltyAmount;

            if (amount < computedAmount) {
              this.exceptionService.throw(
                `Amount must be greater than or equal to ${computedAmount}`,
                "BAD_REQUEST",
              );
              return;
            }

            const hasExcessPayment = amount > computedAmount;

            let totalExcessPayment = 0;
            let computedExcessPayment = excessPayment;

            if (hasExcessPayment) {
              totalExcessPayment = Number((amount - computedAmount).toFixed(2));
              computedExcessPayment += totalExcessPayment;
            }

            const baseDate =
              nextPaymentDate && recurringPaymentDay
                ? this.mtzService
                    .mtz(nextPaymentDate, "dateTimeUTCZ")
                    .add(1, "month")
                    .set("date", recurringPaymentDay)
                : this.mtzService.mtz();

            const installmentNextPaymentDate = baseDate.format(
              this.mtzService.dateFormat.dateTimeUTCZ,
            );

            const computedBalance = balance - computedAmount;
            const totalBalanceAfterAmount =
              computedBalance <= 0 || isLastPaymentDate ? 0 : computedBalance;

            await prisma.payment.create({
              data: {
                modeOfPayment,
                paymentDate,
                amount,
                referenceNumber,
                ...(!!penaltyAmount && {
                  penalized: true,
                  penaltyAmount,
                }),
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
                penaltyAmount: 0,
                penaltyCount: 0,
                ...(!totalBalanceAfterAmount
                  ? { status: "DONE" }
                  : { excessPayment: computedExcessPayment }),
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
              targetDueDate: paymentStartedDate,
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

  async applyPenaltyPayment(
    contractId: string,
    penaltyAmount: number,
    penaltyCount: number,
    transaction: Prisma.TransactionClient,
  ) {
    const transactionService = transaction || this.prismaService;
    try {
      const contractResponse = await transactionService.contract.findFirst({
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

      if (
        contractResponse.penaltyAmount === penaltyAmount &&
        contractResponse.penaltyCount === penaltyCount
      )
        return;

      await transactionService.contract.update({
        where: {
          id: contractId,
        },
        data: {
          penaltyAmount,
          penaltyCount,
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
            ],
          },
          include: {
            payment: {
              include: {
                files: {
                  where: {
                    status: { not: "DELETED" },
                  },
                  omit: {
                    dateCreated: true,
                    dateDeleted: true,
                    dateUpdated: true,
                    status: true,
                    paymentId: true,
                  },
                },
              },
            },
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
          totalCashPayment,
          recurringPaymentDay,
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
            payment: {
              include: {
                files: {
                  where: {
                    status: { not: "DELETED" },
                  },
                  omit: {
                    dateCreated: true,
                    dateDeleted: true,
                    dateUpdated: true,
                    status: true,
                    paymentId: true,
                  },
                },
              },
            },
          },
        });

        let rfValidityStartDate: string | null = null;
        let rfValidityEndDate: string | null = null;

        if (!!reservationFee) {
          rfValidityStartDate = this.mtzService
            .mtz(reservationFee.dateCreated, "dateTimeUTCZ")
            .format(this.mtzService.dateFormat.defaultformat);
          rfValidityEndDate = this.mtzService
            .mtz(reservationFee.validity, "dateTimeUTCZ")
            .format(this.mtzService.dateFormat.defaultformat);
        }

        if (paymentType === "INSTALLMENT") {
          if (
            (downPaymentType === "PARTIAL_DOWN_PAYMENT" ||
              downPaymentType === "FULL_DOWN_PAYMENT") &&
            terms &&
            totalMonthlyDown &&
            totalMonthly &&
            paymentStartedDate &&
            recurringPaymentDay
          ) {
            const parsedPaymentStartedDate = this.mtzService
              .mtz(paymentStartedDate, "dateTimeUTCZ")
              .format(this.mtzService.dateFormat.dateAbbrev);

            const downPaymentBreakdown: PaymentBreakdownType[] = [];

            if (!!reservationFee && !!reservationFee.payment) {
              const { validity, payment: reservationPayment } = reservationFee;

              const reservationPaymentDate = this.mtzService
                .mtz(validity, "dateTimeUTCZ")
                .format(this.mtzService.dateFormat.dateAbbrev);

              downPaymentBreakdown.push({
                dueDate: reservationPaymentDate,
                amount: reservationPayment.amount,
                paidAmount: reservationPayment.amount,
                remainingBalance: tcp - reservationPayment.amount,
                transactionType: reservationPayment.transactionType,
                paid: true,
                files: this.fileService.onFormatPaymentFilesResponse(
                  reservationPayment.files,
                ),
              });
            }

            if (
              downPaymentType === "PARTIAL_DOWN_PAYMENT" &&
              !!downPaymentTerms
            ) {
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
                  files: this.fileService.onFormatPaymentFilesResponse(
                    paymentInDate?.files,
                  ),
                });
              }
            } else {
              const { remainingBalance } = downPaymentBreakdown[0] || {};

              const dueDate = this.mtzService
                .mtz(parsedPaymentStartedDate, "dateAbbrev")
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
                transactionType: "FULL_DOWN_PAYMENT",
                paid: !!paymentInDate,
                files: this.fileService.onFormatPaymentFilesResponse(
                  paymentInDate?.files,
                ),
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

              const isLastPaymentDate =
                i === downPaymentBreakdown.length - 1 + terms - 1;

              const dueDate = this.mtzService
                .mtz(previousDueDate, "dateAbbrev")
                .add(1, "month")
                .set("date", recurringPaymentDay)
                .format(this.mtzService.dateFormat.dateAbbrev);

              const paymentInDate = payment.find(paymentObj => {
                const formattedPaymentDate = this.mtzService
                  .mtz(paymentObj.targetDueDate, "dateTimeUTCZ")
                  .format(this.mtzService.dateFormat.dateAbbrev);

                return formattedPaymentDate === dueDate;
              });

              totalPaymentBreakdown.push({
                dueDate,
                amount: totalMonthly - (isLastPaymentDate ? excessPayment : 0),
                paidAmount: paymentInDate?.amount || 0,
                remainingBalance: remainingBalance - totalMonthly,
                transactionType: "MONTHLY_PAYMENT",
                paid: !!paymentInDate,
                files: this.fileService.onFormatPaymentFilesResponse(
                  paymentInDate?.files,
                ),
              });
            }

            const formattedPaymentBreakdown =
              await this.onFormatPaymentBreakdown(
                totalPaymentBreakdown,
                contractId,
                prisma,
              );

            response = {
              paymentType,
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
              rfValidityStartDate,
              rfValidityEndDate,
              paymentBreakdown: formattedPaymentBreakdown,
            };
          }
        } else {
          const totalPaymentBreakdown: PaymentBreakdownType[] = [];

          if (!!reservationFee && !!reservationFee.payment) {
            const { validity, payment: reservationPayment } = reservationFee;

            const reservationPaymentDate = this.mtzService
              .mtz(validity, "dateTimeUTCZ")
              .format(this.mtzService.dateFormat.dateAbbrev);

            totalPaymentBreakdown.push({
              dueDate: reservationPaymentDate,
              amount: reservationPayment.amount,
              paidAmount: reservationPayment.amount,
              remainingBalance: tcp - reservationPayment.amount,
              transactionType: reservationPayment.transactionType,
              paid: true,
              files: this.fileService.onFormatPaymentFilesResponse(
                reservationPayment.files,
              ),
            });
          }

          const { remainingBalance } = totalPaymentBreakdown[0] || {};

          const dueDate = this.mtzService
            .mtz(paymentStartedDate, "dateTimeUTCZ")
            .format(this.mtzService.dateFormat.dateAbbrev);

          const paymentInDate = payment.find(paymentObj => {
            const formattedPaymentDate = this.mtzService
              .mtz(paymentObj.targetDueDate, "dateTimeUTCZ")
              .format(this.mtzService.dateFormat.dateAbbrev);

            return formattedPaymentDate === dueDate;
          });

          totalPaymentBreakdown.push({
            dueDate,
            amount: totalCashPayment || 0,
            paidAmount: paymentInDate?.amount || 0,
            remainingBalance: remainingBalance - (totalCashPayment || 0),
            transactionType: "TCP_FULL_PAYMENT",
            paid: !!paymentInDate,
            files: this.fileService.onFormatPaymentFilesResponse(
              paymentInDate?.files,
            ),
          });

          const formattedPaymentBreakdown = await this.onFormatPaymentBreakdown(
            totalPaymentBreakdown,
            contractId,
            prisma,
          );

          response = {
            paymentType,
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
            rfValidityStartDate,
            rfValidityEndDate,
            paymentBreakdown: formattedPaymentBreakdown,
          };
        }
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAgentCommissionBreakdown(agentCommissionId: string) {
    try {
      let response: PaymentBreakdownType[] = [];
      await this.prismaService.$transaction(async prisma => {
        const agentCommissionResponse = await prisma.agentCommission.findFirst({
          where: {
            AND: [
              {
                id: agentCommissionId,
              },
              {
                status: { not: "DELETED" },
              },
            ],
          },
          include: {
            agent: {
              include: {
                contract: true,
              },
            },
            payment: {
              include: {
                files: {
                  where: {
                    status: { not: "DELETED" },
                  },
                  omit: {
                    dateCreated: true,
                    dateDeleted: true,
                    dateUpdated: true,
                    status: true,
                  },
                },
              },
            },
          },
        });

        const {
          terms,
          releaseStartDate,
          recurringReleaseDate,
          monthlyReleaseAmount,
          agent,
          payment,
        } = agentCommissionResponse || {};

        const { contract } = agent || {};

        if (
          !terms ||
          !recurringReleaseDate ||
          !releaseStartDate ||
          !contract ||
          !monthlyReleaseAmount
        ) {
          this.exceptionService.throw(
            "Agent commission must have a [terms, recurringReleaseDate, releaseStartDate, contract, monthlyReleaseAmount] for showing release breakdown",
            "BAD_REQUEST",
          );
          return;
        }

        const { agentCommissionTotal } = contract;

        const releaseBreakdown: PaymentBreakdownType[] = [];

        const onGetPaidInDate = (dueDate: string) => {
          return payment?.find(({ targetDueDate }) => {
            const parsedTargetDueDate = this.mtzService
              .mtz(targetDueDate, "dateTimeUTCZ")
              .format(this.mtzService.dateFormat.dateAbbrev);
            return parsedTargetDueDate === dueDate;
          });
        };

        const dueDate = this.mtzService.mtz(releaseStartDate, "dateTimeUTCZ");

        const startingDueDate = dueDate
          .clone()
          .add(1, "month")
          .set("date", recurringReleaseDate)
          .format(this.mtzService.dateFormat.dateAbbrev);

        releaseBreakdown.push({
          dueDate: startingDueDate,
          transactionType: "AGENT_COMMISSION_RELEASE",
          amount: monthlyReleaseAmount,
          paidAmount: onGetPaidInDate(startingDueDate)?.amount || 0,
          paid: !!onGetPaidInDate(startingDueDate),
          remainingBalance: agentCommissionTotal - monthlyReleaseAmount,
          files: this.fileService.onFormatPaymentFilesResponse(
            onGetPaidInDate(startingDueDate)?.files,
          ),
        });

        for (let i = 0; i < terms - 1; i++) {
          const { dueDate: previousDueDate, remainingBalance } =
            releaseBreakdown[i] || {};
          const dueDate = this.mtzService
            .mtz(previousDueDate, "dateAbbrev")
            .add(1, "month")
            .set("date", recurringReleaseDate)
            .format(this.mtzService.dateFormat.dateAbbrev);

          releaseBreakdown.push({
            dueDate,
            transactionType: "AGENT_COMMISSION_RELEASE",
            amount: monthlyReleaseAmount,
            paidAmount: onGetPaidInDate(dueDate)?.amount || 0,
            paid: !!onGetPaidInDate(dueDate),
            remainingBalance: remainingBalance - monthlyReleaseAmount,
            files: this.fileService.onFormatPaymentFilesResponse(
              onGetPaidInDate(dueDate)?.files,
            ),
          });
        }

        response = releaseBreakdown;
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async releaseAgentCommission(
    agentCommissionId: string,
    dto: CreateUpdatePaymentDto,
  ) {
    try {
      const {
        amount,
        modeOfPayment,
        paymentDate,
        transactionType,
        referenceNumber,
      } = dto || {};

      await this.prismaService.$transaction(async prisma => {
        if (transactionType !== "AGENT_COMMISSION_RELEASE") {
          this.exceptionService.throw(
            "Transaction type must be AGENT_COMMISSION_RELEASE",
            "BAD_REQUEST",
          );
          return;
        }

        const agentCommissionResponse = await prisma.agentCommission.findFirst({
          where: {
            AND: [
              {
                id: agentCommissionId,
              },
              {
                status: { not: "DELETED" },
              },
            ],
          },
        });

        if (!agentCommissionResponse) {
          this.exceptionService.throw(
            "Agent commission not found",
            "NOT_FOUND",
          );
          return;
        }

        const {
          balance,
          nextReleaseDate,
          recurringReleaseDate,
          monthlyReleaseAmount,
          status,
        } = agentCommissionResponse;

        if (status === "DONE") {
          this.exceptionService.throw(
            "There are no pending releases for this agent",
            "BAD_REQUEST",
          );
          return;
        }

        if (amount < (monthlyReleaseAmount || 0)) {
          this.exceptionService.throw(
            `Amount must be greater than or equal to ${monthlyReleaseAmount}`,
            "BAD_REQUEST",
          );
          return;
        }

        const computedBalance = balance - (monthlyReleaseAmount || 0);
        const parsedNextReleaseDate = this.mtzService.mtz(
          nextReleaseDate,
          "dateTimeUTCZ",
        );

        const releaseNextDate = !!recurringReleaseDate
          ? parsedNextReleaseDate
              .clone()
              .add(1, "month")
              .set("date", recurringReleaseDate)
              .format(this.mtzService.dateFormat.dateTimeUTCZ)
          : null;

        const isZeroBalance = Math.trunc(computedBalance) <= 0;

        await prisma.payment.create({
          data: {
            agentCommission: {
              connect: {
                id: agentCommissionId,
              },
            },
            targetDueDate: nextReleaseDate,
            amount,
            modeOfPayment,
            paymentDate,
            referenceNumber,
            transactionType: "AGENT_COMMISSION_RELEASE",
          },
        });

        await prisma.agentCommission.update({
          where: {
            id: agentCommissionId,
          },
          data: {
            ...(!isZeroBalance
              ? { balance: computedBalance }
              : { balance: 0, status: "DONE" }),
            nextReleaseDate: releaseNextDate,
          },
        });
      });

      return "Agent commission released successfully";
    } catch (error) {
      throw error;
    }
  }

  async getPaymentHistory(contractId: string) {
    try {
      let response: any[] = [];

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

        const { lotId, clientId } = contractResponse;

        const reservation = await prisma.reservation.findFirst({
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
        });

        const payments = await prisma.payment.findMany({
          where: {
            OR: [
              {
                contractId,
              },
              {
                reservationId: reservation?.id,
              },
            ],
          },
          omit: {
            dateCreated: true,
            dateUpdated: true,
            dateDeleted: true,
          },
        });

        response = payments;
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getPaymentReservationHistory(reservationId: string) {
    try {
      return await this.prismaService.payment.findFirst({
        where: {
          reservationId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async onFormatPaymentBreakdown(
    data: PaymentBreakdownType[],
    contractId: string,
    prisma: Prisma.TransactionClient,
  ) {
    let unpaidDate: string | null = null;
    return await Promise.all(
      data.map(async ({ remainingBalance, dueDate, paid, ...rest }) => {
        const penaltyObj: Pick<
          PaymentBreakdownType,
          "penalized" | "penaltyAmount"
        > = {
          penalized: false,
          penaltyAmount: 0,
        };

        if (!unpaidDate && !paid) {
          unpaidDate = dueDate;
        }

        if (!!unpaidDate) {
          const formattedUnpaidDate = this.mtzService.mtz(
            unpaidDate,
            "dateAbbrev",
          );
          const currentDate = this.mtzService.mtz();
          const paymentDateDiffToDueDate = currentDate.diff(
            formattedUnpaidDate,
            "days",
          );

          const penaltyDiffCount =
            paymentDateDiffToDueDate > 0
              ? Math.trunc(paymentDateDiffToDueDate / 7)
              : 0;

          const paymentPenaltyAmount =
            PAYMENT_PENALTY_AMOUNT * penaltyDiffCount;

          if (!!penaltyDiffCount) {
            penaltyObj.penalized = true;
            penaltyObj.penaltyAmount = paymentPenaltyAmount;
            await this.applyPenaltyPayment(
              contractId,
              paymentPenaltyAmount,
              penaltyDiffCount,
              prisma,
            );
          }
        }

        return {
          ...rest,
          dueDate,
          paid,
          ...(unpaidDate &&
            unpaidDate === dueDate &&
            Object.values(penaltyObj).every(val => !!val) &&
            penaltyObj),
          remainingBalance: this.formatterService.onParseToPhp(
            this.formatterService.onTruncateNumber(remainingBalance),
          ),
        };
      }),
    );
  }

  async uploadPfp(paymentId: string, files: Express.Multer.File[]) {
    try {
      let response: string | null = null;

      await this.prismaService.$transaction(async prisma => {
        if (!files || !files.length) {
          response = "No file uploaded";
          return;
        }

        await Promise.all(
          files.map(async file => {
            const { originalname, path } = file;
            const ext = this.uploadService.extractFileExt(originalname);

            await prisma.file.create({
              data: {
                path,
                name: originalname,
                ext,
                payment: {
                  connect: {
                    id: paymentId,
                  },
                },
              },
            });
          }),
        );

        response = "File uploaded successfully";
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}
