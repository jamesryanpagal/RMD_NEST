import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import {
  AdjustReservationValidityDto,
  ApplyPenaltyPaymentDto,
  CreateUpdatePaymentDto,
  PaymentBreakdownType,
} from "./dto";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { FormatterService } from "src/services/formatter/formatter.service";
import { Prisma } from "generated/prisma";
import { UploadService } from "src/services/upload/upload.service";
import { FileService } from "src/file/file.service";
import { UserFullDetailsProps } from "src/type";
import { MessagingService } from "src/services/messaging/messaging.service";

export const PAYMENT_PENALTY_AMOUNT = 0.5;

@Injectable()
export class PaymentService {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
    private mtzService: MtzService,
    private formatterService: FormatterService,
    private uploadService: UploadService,
    private fileService: FileService,
    private messagingService: MessagingService,
  ) {}

  private readonly logger = new Logger(PaymentService.name, {
    timestamp: true,
  });

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

  async createContractPayment(
    contractId: string,
    files: Express.Multer.File[],
    dto: CreateUpdatePaymentDto,
    user?: UserFullDetailsProps,
  ) {
    const {
      modeOfPayment,
      paymentDate,
      amount,
      referenceNumber,
      transactionType,
      sendReceipt,
      waivePenalty,
      waivedReason,
    } = dto || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        if (!user) {
          this.exceptionService.throw("User not found", "NOT_FOUND");
          return;
        }

        const contractResponse = await prisma.contract.findFirst({
          where: {
            AND: [
              {
                id: contractId,
              },
              {
                status: { notIn: ["DELETED", "FORFEITED"] },
              },
            ],
          },
          include: {
            client: true,
            lot: {
              include: {
                block: {
                  include: {
                    phase: {
                      include: {
                        project: true,
                      },
                    },
                  },
                },
              },
            },
            agent: true,
          },
        });

        if (!contractResponse) {
          this.exceptionService.throw(
            "Contract not found, it is either deleted or forfeited.",
            "NOT_FOUND",
          );
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
          penaltyCount,
          client,
          lot,
          agent,
          installmentType,
        } = contractResponse || {};

        if (paymentType === "INSTALLMENT") {
          if (
            downPaymentType === "PARTIAL_DOWN_PAYMENT" &&
            downPaymentStatus === "ON_GOING" &&
            totalMonthlyDown &&
            totalDownPaymentBalance
          ) {
            const totalPayment =
              totalMonthlyDown + (waivePenalty ? 0 : penaltyAmount);

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

            const paymentResponse = await prisma.payment.create({
              data: {
                modeOfPayment,
                paymentDate,
                amount,
                referenceNumber,
                ...(!!penaltyAmount && {
                  penalized: true,
                  penaltyAmount,
                  penaltyCount,
                }),
                ...(!!waivePenalty && {
                  waivedPenalty: true,
                  waivedReason,
                }),
                targetDueDate: nextPaymentDate,
                transactionType,
                contract: {
                  connect: {
                    id: contractId,
                  },
                },
                createdBy: user.id,
              },
            });

            const { id: paymentResponseId, receiptNo } = paymentResponse || {};

            await this.uploadPfp(paymentResponseId, files, user, prisma);

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
                updatedBy: user.id,
              },
            });

            if (!!sendReceipt && !!client && !!lot && !!agent) {
              const {
                email,
                firstName,
                lastName,
                street,
                barangay,
                city,
                province,
              } = client || {};
              const { firstName: agentFirstName, lastName: agentLastName } =
                agent || {};
              const { block, title: lotTitle } = lot || {};
              const { phase, title: blockTitle } = block || {};
              const { project } = phase || {};
              const { projectName } = project || {};
              await this.messagingService.onSendPaymentReceipt({
                clientName: `${firstName} ${lastName}`,
                email,
                street,
                barangay,
                city,
                province,
                projectName,
                lot: lotTitle || "",
                block: blockTitle || "",
                modeOfPayment,
                referenceNumber,
                agent: `${agentFirstName} ${agentLastName}`,
                totalInWords: this.formatterService.onNumberToWords(amount),
                total: this.formatterService.onParseToPhp(amount),
                receiptNumber: receiptNo,
              });
            }
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
                    .mtz(nextPaymentDate, "dateTimeUTCZ")
                    .add(1, "month")
                    .set("date", recurringPaymentDay)
                : this.mtzService.mtz();

            const installmentNextPaymentDate = baseDate.format(
              this.mtzService.dateFormat.dateTimeUTCZ,
            );

            const paymentResponse = await prisma.payment.create({
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
                createdBy: user.id,
              },
            });

            const { id: paymentResponseId, receiptNo } = paymentResponse || {};

            await this.uploadPfp(paymentResponseId, files, user, prisma);

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
                updatedBy: user.id,
              },
            });

            if (!!sendReceipt && !!client && !!lot && !!agent) {
              const {
                email,
                firstName,
                lastName,
                street,
                barangay,
                city,
                province,
              } = client || {};
              const { firstName: agentFirstName, lastName: agentLastName } =
                agent || {};
              const { block, title: lotTitle } = lot || {};
              const { phase, title: blockTitle } = block || {};
              const { project } = phase || {};
              const { projectName } = project || {};
              await this.messagingService.onSendPaymentReceipt({
                clientName: `${firstName} ${lastName}`,
                email,
                street,
                barangay,
                city,
                province,
                projectName,
                lot: lotTitle || "",
                block: blockTitle || "",
                modeOfPayment,
                referenceNumber,
                agent: `${agentFirstName} ${agentLastName}`,
                totalInWords: this.formatterService.onNumberToWords(amount),
                total: this.formatterService.onParseToPhp(amount),
                receiptNumber: receiptNo,
              });
            }
          } else if (
            (downPaymentStatus === "DONE" ||
              installmentType === "STRAIGHT_MONTHLY_PAYMENT") &&
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
              ? totalMonthly +
                (waivePenalty ? 0 : penaltyAmount) -
                excessPayment
              : totalMonthly + (waivePenalty ? 0 : penaltyAmount);

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

            const computedBalance = balance - totalMonthly;
            const totalBalanceAfterAmount =
              computedBalance <= 0 || isLastPaymentDate ? 0 : computedBalance;

            const paymentResponse = await prisma.payment.create({
              data: {
                modeOfPayment,
                paymentDate,
                amount,
                referenceNumber,
                ...(!!penaltyAmount && {
                  penalized: true,
                  penaltyAmount,
                  penaltyCount,
                }),
                ...(!!waivePenalty && {
                  waivedPenalty: true,
                  waivedReason,
                }),
                targetDueDate: nextPaymentDate,
                transactionType,
                contract: {
                  connect: {
                    id: contractId,
                  },
                },
                createdBy: user.id,
              },
            });

            const { id: paymentResponseId, receiptNo } = paymentResponse || {};

            await this.uploadPfp(paymentResponseId, files, user, prisma);

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
                updatedBy: user.id,
              },
            });

            if (!totalBalanceAfterAmount) {
              await prisma.lot.update({
                where: {
                  id: contractResponse.lotId,
                },
                data: {
                  status: "SOLD",
                  updatedBy: user.id,
                },
              });
            }

            if (!!sendReceipt && !!client && !!lot && !!agent) {
              const {
                email,
                firstName,
                lastName,
                street,
                barangay,
                city,
                province,
              } = client || {};
              const { firstName: agentFirstName, lastName: agentLastName } =
                agent || {};
              const { block, title: lotTitle } = lot || {};
              const { phase, title: blockTitle } = block || {};
              const { project } = phase || {};
              const { projectName } = project || {};
              await this.messagingService.onSendPaymentReceipt({
                clientName: `${firstName} ${lastName}`,
                email,
                street,
                barangay,
                city,
                province,
                projectName,
                lot: lotTitle || "",
                block: blockTitle || "",
                modeOfPayment,
                referenceNumber,
                agent: `${agentFirstName} ${agentLastName}`,
                totalInWords: this.formatterService.onNumberToWords(amount),
                total: this.formatterService.onParseToPhp(amount),
                receiptNumber: receiptNo,
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

          if (status === "DONE") {
            this.exceptionService.throw(
              "There's nothing to pay for this contract",
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

          const paymentResponse = await prisma.payment.create({
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
              createdBy: user.id,
            },
          });

          const { id: paymentResponseId, receiptNo } = paymentResponse || {};

          await this.uploadPfp(paymentResponseId, files, user, prisma);

          await prisma.contract.update({
            where: {
              id: contractId,
            },
            data: {
              balance: 0,
              status: "DONE",
              updatedBy: user.id,
            },
          });

          await prisma.lot.update({
            where: {
              id: contractResponse.lotId,
            },
            data: {
              status: "SOLD",
              updatedBy: user.id,
            },
          });

          if (!!sendReceipt && !!client && !!lot && !!agent) {
            const {
              email,
              firstName,
              lastName,
              street,
              barangay,
              city,
              province,
            } = client || {};
            const { firstName: agentFirstName, lastName: agentLastName } =
              agent || {};
            const { block, title: lotTitle } = lot || {};
            const { phase, title: blockTitle } = block || {};
            const { project } = phase || {};
            const { projectName } = project || {};
            await this.messagingService.onSendPaymentReceipt({
              clientName: `${firstName} ${lastName}`,
              email,
              street,
              barangay,
              city,
              province,
              projectName,
              lot: lotTitle || "",
              block: blockTitle || "",
              modeOfPayment,
              referenceNumber,
              agent: `${agentFirstName} ${agentLastName}`,
              totalInWords: this.formatterService.onNumberToWords(amount),
              total: this.formatterService.onParseToPhp(amount),
              receiptNumber: receiptNo,
            });
          }
        }
      });

      return "Payment created successfully";
    } catch (error) {
      await this.uploadService.rollBackFiles(files);
      throw error;
    }
  }

  async updatePayment(
    id: string,
    dto: CreateUpdatePaymentDto,
    user?: UserFullDetailsProps,
  ) {
    const { modeOfPayment, paymentDate, amount, referenceNumber } = dto || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        if (!user) {
          this.exceptionService.throw("User not found", "NOT_FOUND");
          return;
        }

        const { role } = user || {};

        const paymentResponse = await prisma.payment.findFirst({
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

        if (!paymentResponse) {
          this.exceptionService.throw("Payment not found", "NOT_FOUND");
          return;
        }

        if (paymentResponse.amount > amount) {
          this.exceptionService.throw(
            `Amount must be greater than or equal to ${paymentResponse.amount}`,
            "BAD_REQUEST",
          );
          return;
        }

        if (role === "SECRETARY") {
          const {
            transactionType,
            targetDueDate,
            penalized,
            penaltyAmount,
            receiptNo,
          } = paymentResponse || {};

          await prisma.paymentRequest.create({
            data: {
              transactionType,
              modeOfPayment,
              targetDueDate,
              paymentDate,
              amount,
              referenceNumber,
              penalized,
              penaltyAmount,
              receiptNo,
              requestType: "UPDATE",
              createdBy: user.id,
              payment: {
                connect: {
                  id,
                },
              },
            },
          });
        } else {
          await prisma.payment.update({
            where: {
              id,
            },
            data: {
              modeOfPayment,
              paymentDate,
              amount,
              referenceNumber,
              updatedBy: user.id,
            },
          });
        }
      });

      return "Payment updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async deletePayment(id: string, user?: UserFullDetailsProps) {
    try {
      await this.prismaService.$transaction(async prisma => {
        if (!user) {
          this.exceptionService.throw("User not found", "NOT_FOUND");
          return;
        }

        const { role } = user || {};

        if (role === "SECRETARY") {
          const paymentResponse = await prisma.payment.findFirst({
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

          if (!paymentResponse) {
            this.exceptionService.throw("Payment not found", "NOT_FOUND");
            return;
          }

          const {
            transactionType,
            modeOfPayment,
            targetDueDate,
            paymentDate,
            amount,
            referenceNumber,
            penalized,
            penaltyAmount,
            receiptNo,
          } = paymentResponse || {};

          await prisma.paymentRequest.create({
            data: {
              transactionType,
              modeOfPayment,
              targetDueDate,
              paymentDate,
              amount,
              referenceNumber,
              penalized,
              penaltyAmount,
              receiptNo,
              requestType: "DELETE",
              createdBy: user.id,
              payment: {
                connect: {
                  id,
                },
              },
            },
          });
        } else {
          await prisma.payment.update({
            where: {
              id,
            },
            data: {
              status: "DELETED",
              deletedBy: user.id,
            },
          });
        }
      });

      return "Payment deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  async getPayment(id: string) {
    try {
      const paymentResponse = await this.prismaService.payment.findFirst({
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
        include: {
          files: true,
        },
      });

      const { files, ...rest } = paymentResponse || {};

      return {
        ...rest,
        files: this.fileService.onFormatPaymentFilesResponse(files),
      };
    } catch (error) {
      throw error;
    }
  }

  async applyPenaltyPayment(
    id: string,
    dto: ApplyPenaltyPaymentDto,
    user?: UserFullDetailsProps,
  ) {
    const { penaltyAmount, penaltyCount } = dto || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        const contractResponse = await prisma.contract.findFirst({
          where: {
            AND: [
              {
                id,
              },
              {
                status: { notIn: ["DELETED", "FORFEITED"] },
              },
            ],
          },
        });

        if (!contractResponse) {
          this.exceptionService.throw(
            "Contract not found, it is either deleted or forfeited.",
            "NOT_FOUND",
          );
          return;
        }

        const {
          penaltyAmount: currentPenaltyAmount,
          penaltyCount: currentPenaltyCount,
        } = contractResponse || {};

        if (
          currentPenaltyAmount === penaltyAmount &&
          currentPenaltyCount === penaltyCount
        ) {
          this.exceptionService.throw(
            "Penalty amount and penalty count are already applied.",
            "BAD_REQUEST",
          );
          return;
        }

        await prisma.contract.update({
          where: {
            id,
          },
          data: {
            penaltyAmount,
            penaltyCount,
            updatedBy: user?.id,
          },
        });
      });

      return "Penalty payment applied successfully";
    } catch (error) {
      throw error;
    }
  }

  async adjustReservationValidity(
    id: string,
    dto: AdjustReservationValidityDto,
    user?: UserFullDetailsProps,
  ) {
    const { validity } = dto || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        const reservationResponse = await prisma.reservation.findFirst({
          where: {
            AND: [
              {
                id,
              },
              {
                status: "FORFEITED",
              },
            ],
          },
        });

        if (!reservationResponse) {
          this.exceptionService.throw("Reservation not found", "NOT_FOUND");
          return;
        }

        const newValidity = this.mtzService
          .mtz(validity, "defaultformat")
          .toDate();

        await prisma.reservation.update({
          where: {
            id,
          },
          data: {
            status: "ACTIVE",
            validity: newValidity,
            updatedBy: user?.id,
          },
        });
      });
      return "Reservation validity adjusted successfully";
    } catch (error) {
      throw error;
    }
  }

  // async applyPenaltyPayment(
  //   contractId: string,
  //   penaltyAmount: number,
  //   penaltyCount: number,
  //   transaction: Prisma.TransactionClient,
  // ) {
  //   const transactionService = transaction || this.prismaService;
  //   try {
  //     const contractResponse = await transactionService.contract.findFirst({
  //       where: {
  //         AND: [
  //           {
  //             id: contractId,
  //           },
  //           {
  //             status: { not: "DELETED" },
  //           },
  //         ],
  //       },
  //     });

  //     if (!contractResponse) {
  //       this.exceptionService.throw("Contract not found", "NOT_FOUND");
  //       return;
  //     }

  //     if (
  //       contractResponse.penaltyAmount === penaltyAmount &&
  //       contractResponse.penaltyCount === penaltyCount
  //     )
  //       return;

  //     await transactionService.contract.update({
  //       where: {
  //         id: contractId,
  //       },
  //       data: {
  //         penaltyAmount,
  //         penaltyCount,
  //       },
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // }

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
            agent: {
              omit: {
                dateCreated: true,
                dateUpdated: true,
                dateDeleted: true,
                status: true,
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
          installmentType,
          paymentStartedDate,
          agentCommission,
          agentCommissionTotal,
          terms,
          payment,
          lot,
          client,
          sqmPrice,
          totalLotPrice,
          totalDownPayment,
          miscellaneous,
          miscellaneousTotal,
          excessPayment,
          totalCashPayment,
          recurringPaymentDay,
          agent,
          interest,
          status,
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

        if (reservationFee) {
          rfValidityStartDate = this.mtzService
            .mtz(reservationFee.dateCreated, "dateTimeUTCZ")
            .format(this.mtzService.dateFormat.defaultformat);
          rfValidityEndDate = this.mtzService
            .mtz(reservationFee.validity, "dateTimeUTCZ")
            .format(this.mtzService.dateFormat.defaultformat);
        }

        if (paymentType !== "CASH") {
          if (
            terms &&
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
                id: reservationPayment.id,
                reservationId: reservationPayment.reservationId,
                referenceNumber: reservationPayment.referenceNumber,
                modeOfPayment: reservationPayment.modeOfPayment,
                paymentDate: reservationPayment.paymentDate,
                receiptNo: reservationPayment.receiptNo,
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
              totalMonthlyDown &&
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
                  id: paymentInDate?.id,
                  referenceNumber: paymentInDate?.referenceNumber,
                  modeOfPayment: paymentInDate?.modeOfPayment,
                  paymentDate: paymentInDate?.paymentDate,
                  receiptNo: paymentInDate?.receiptNo,
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
            } else if (
              downPaymentType === "FULL_DOWN_PAYMENT" &&
              totalMonthlyDown
            ) {
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
                id: paymentInDate?.id,
                referenceNumber: paymentInDate?.referenceNumber,
                modeOfPayment: paymentInDate?.modeOfPayment,
                paymentDate: paymentInDate?.paymentDate,
                receiptNo: paymentInDate?.receiptNo,
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
              const {
                dueDate: previousDueDate,
                transactionType: previousTransactionType,
                remainingBalance,
              } = totalPaymentBreakdown[i] || {};

              const isLastPaymentDate =
                i === downPaymentBreakdown.length - 1 + terms - 1;

              const dueDate =
                previousTransactionType === "RESERVATION_FEE"
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

              totalPaymentBreakdown.push({
                id: paymentInDate?.id,
                referenceNumber: paymentInDate?.referenceNumber,
                modeOfPayment: paymentInDate?.modeOfPayment,
                paymentDate: paymentInDate?.paymentDate,
                receiptNo: paymentInDate?.receiptNo,
                dueDate,
                amount: totalMonthly - (isLastPaymentDate ? excessPayment : 0),
                paidAmount: paymentInDate?.amount || 0,
                remainingBalance: Number(
                  Math.floor(Math.abs(remainingBalance - totalMonthly)).toFixed(
                    2,
                  ),
                ),
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
              installmentType,
              client,
              project: projectResponse,
              phase: phaseResponse,
              block: blockResponse,
              lot: lotResponse,
              sqm: lot?.sqm,
              totalLotPrice,
              downPaymentTerms,
              terms,
              sqmPrice,
              miscellaneous,
              miscellaneousTotal,
              totalDownPayment,
              tcp,
              excessPayment,
              rfValidityStartDate,
              rfValidityEndDate,
              agent,
              agentCommission,
              agentCommissionTotal,
              interest,
              status,
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
              id: reservationPayment.id,
              referenceNumber: reservationPayment.referenceNumber,
              modeOfPayment: reservationPayment.modeOfPayment,
              paymentDate: reservationPayment.paymentDate,
              receiptNo: reservationPayment.receiptNo,
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
            id: paymentInDate?.id,
            referenceNumber: paymentInDate?.referenceNumber,
            modeOfPayment: paymentInDate?.modeOfPayment,
            paymentDate: paymentInDate?.paymentDate,
            receiptNo: paymentInDate?.receiptNo,
            dueDate,
            amount: totalCashPayment || 0,
            paidAmount: paymentInDate?.amount || 0,
            remainingBalance: Number(
              Math.floor(
                Math.abs(remainingBalance - (totalCashPayment || 0)),
              ).toFixed(2),
            ),
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
            installmentType,
            client,
            project: projectResponse,
            phase: phaseResponse,
            block: blockResponse,
            lot: lotResponse,
            sqm: lot?.sqm,
            sqmPrice,
            totalLotPrice,
            downPaymentTerms,
            terms,
            miscellaneous,
            miscellaneousTotal,
            totalDownPayment,
            tcp,
            excessPayment,
            rfValidityStartDate,
            rfValidityEndDate,
            agent,
            agentCommission,
            agentCommissionTotal,
            interest,
            status,
            paymentBreakdown: formattedPaymentBreakdown,
          };
        }
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAgentCommissionBreakdown(id: string) {
    try {
      let response: PaymentBreakdownType[] = [];
      await this.prismaService.$transaction(async prisma => {
        const agentCommissionResponse = await prisma.agentCommission.findFirst({
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
          include: {
            agent: true,
            contract: true,
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
          contract,
          payment,
        } = agentCommissionResponse || {};

        if (
          !terms ||
          !recurringReleaseDate ||
          !releaseStartDate ||
          !contract ||
          !monthlyReleaseAmount
        ) {
          this.exceptionService.throw(
            "Agent commission must be started first before showing release breakdown",
            "BAD_REQUEST",
          );
          return;
        }

        const { agentCommissionTotal } = contract || {};

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
          .set("date", recurringReleaseDate)
          .format(this.mtzService.dateFormat.dateAbbrev);

        releaseBreakdown.push({
          id: onGetPaidInDate(startingDueDate)?.id,
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
            id: onGetPaidInDate(dueDate)?.id,
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
    files: Express.Multer.File[],
    user?: UserFullDetailsProps,
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
        if (!user) {
          this.exceptionService.throw("User not found", "NOT_FOUND");
          return;
        }

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
                status: { notIn: ["DELETED", "CONTRACT_FORFEITED"] },
              },
            ],
          },
        });

        if (!agentCommissionResponse) {
          this.exceptionService.throw(
            "Agent commission not found, it is either deleted or contract has been forfeited.",
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

        const releaseNextDate = recurringReleaseDate
          ? parsedNextReleaseDate
              .clone()
              .add(1, "month")
              .set("date", recurringReleaseDate)
              .format(this.mtzService.dateFormat.dateTimeUTCZ)
          : null;

        const isZeroBalance = Math.trunc(computedBalance) <= 0;

        const paymentResponse = await prisma.payment.create({
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
            createdBy: user.id,
          },
        });

        const { id: paymentResponseId } = paymentResponse || {};

        await this.uploadPfp(paymentResponseId, files, user, prisma);

        await prisma.agentCommission.update({
          where: {
            id: agentCommissionId,
          },
          data: {
            ...(!isZeroBalance
              ? { balance: computedBalance }
              : { balance: 0, status: "DONE" }),
            nextReleaseDate: releaseNextDate,
            updatedBy: user.id,
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
            AND: [
              {
                OR: [
                  {
                    contractId,
                  },
                  {
                    reservationId: reservation?.id,
                  },
                ],
              },
              {
                status: { not: "DELETED" },
              },
            ],
          },
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
          omit: {
            dateCreated: true,
            dateUpdated: true,
            dateDeleted: true,
            status: true,
          },
        });

        const formattedPaymentResponse = await Promise.all(
          payments.map(({ files, ...rest }) => {
            const formattedFiles =
              this.fileService.onFormatPaymentFilesResponse(files);
            return {
              ...rest,
              files: formattedFiles,
            };
          }),
        );

        response = formattedPaymentResponse;
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getCommissionPaymentHistory(agentCommissionId: string) {
    try {
      const paymentCommissionResponse =
        await this.prismaService.payment.findMany({
          where: {
            AND: [
              {
                transactionType: "AGENT_COMMISSION_RELEASE",
              },
              {
                agentCommissionId,
              },
              {
                status: { not: "DELETED" },
              },
            ],
          },
          omit: {
            dateCreated: true,
            dateUpdated: true,
            dateDeleted: true,
            status: true,
          },
          include: {
            files: {
              where: {
                status: { not: "DELETED" },
              },
              omit: {
                dateCreated: true,
                dateDeleted: true,
                dateUpdated: true,
              },
            },
          },
        });

      const formattedResponse = await Promise.all(
        paymentCommissionResponse.map(({ files, ...rest }) => {
          const formattedFiles =
            this.fileService.onFormatPaymentFilesResponse(files);
          return {
            ...rest,
            files: formattedFiles,
          };
        }),
      );

      return formattedResponse;
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
    const formattedList = await Promise.all(
      data.map(
        async ({ remainingBalance, dueDate, paid, amount, id, ...rest }) => {
          const penaltyObj: Pick<
            PaymentBreakdownType,
            "penalized" | "penaltyAmount" | "penaltyCount" | "waivedPenalty"
          > = {
            penalized: false,
            penaltyAmount: 0,
            penaltyCount: 0,
            waivedPenalty: null,
          };

          const weeksPassedFromDueDate = this.mtzService
            .mtz()
            .diff(this.mtzService.mtz(dueDate, "dateAbbrev"), "weeks");

          if (!paid && weeksPassedFromDueDate > 0) {
            const additionalCharge = amount * PAYMENT_PENALTY_AMOUNT;
            const totalAdditionalCharge =
              additionalCharge * weeksPassedFromDueDate;

            penaltyObj.penalized = true;
            penaltyObj.penaltyAmount = totalAdditionalCharge;
            penaltyObj.penaltyCount = weeksPassedFromDueDate;
          } else {
            const paymentResponse = await prisma.payment.findFirst({
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
            if (paymentResponse) {
              const { penalized, penaltyAmount, waivedPenalty, penaltyCount } =
                paymentResponse || {};
              penaltyObj.penalized = penalized;
              penaltyObj.penaltyAmount = penaltyAmount;
              penaltyObj.waivedPenalty = waivedPenalty;
              penaltyObj.penaltyCount = penaltyCount;
            }
          }

          return {
            ...rest,
            id,
            amount,
            dueDate,
            paid,
            ...penaltyObj,
            remainingBalance: this.formatterService.onParseToPhp(
              this.formatterService.onTruncateNumber(remainingBalance),
            ),
          };
        },
      ),
    );

    const nextPenaltyPayment = formattedList.filter(
      ({ paid, penalized }) => !paid && penalized,
    )?.[0];

    if (nextPenaltyPayment) {
      const { penaltyAmount, penaltyCount } = nextPenaltyPayment || {};
      const contractResponse = await prisma.contract.findFirst({
        where: {
          AND: [
            {
              id: contractId,
            },
            {
              status: { notIn: ["DELETED", "FORFEITED"] },
            },
          ],
        },
      });

      const {
        penaltyAmount: currentPenaltyAmount,
        penaltyCount: currentPenaltyCount,
      } = contractResponse || {};

      if (
        penaltyAmount !== currentPenaltyAmount &&
        penaltyCount !== currentPenaltyCount
      ) {
        await prisma.contract.update({
          where: {
            id: contractId,
          },
          data: {
            penaltyAmount,
            penaltyCount,
          },
        });
      } else {
        this.logger.log(
          "Penalty amount and penalty count are already applied.",
        );
      }
    }

    return formattedList;
  }

  async onCreatePaymentFiles(
    paymentId: string,
    files: Express.Multer.File[],
    prisma: Prisma.TransactionClient,
    user?: UserFullDetailsProps,
  ) {
    try {
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
              createdBy: user?.id,
            },
          });
        }),
      );
    } catch (error) {
      throw error;
    }
  }

  async uploadPfp(
    paymentId: string,
    files: Express.Multer.File[],
    user?: UserFullDetailsProps,
    transactionClient?: Prisma.TransactionClient,
  ) {
    try {
      let response: string = "Files uploaded successfully";

      if (!files || !files.length) {
        response = "No files to upload";
      } else if (transactionClient) {
        await this.onCreatePaymentFiles(
          paymentId,
          files,
          transactionClient,
          user,
        );
      } else {
        await this.prismaService.$transaction(async prisma => {
          await this.onCreatePaymentFiles(paymentId, files, prisma, user);
        });
      }

      return response;
    } catch (error) {
      throw error;
    }
  }
}
