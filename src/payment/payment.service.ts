import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import { CreateUpdatePaymentDto } from "./dto";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { MtzService } from "src/services/mtz/mtz.service";

@Injectable()
export class PaymentService {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
    private mtzService: MtzService,
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

            if (transactionType !== "PARTIAL_DOWN_PAYMENT") {
              this.exceptionService.throw(
                "Payment must be for PARTIAL_DOWN_PAYMENT on this transaction",
                "BAD_REQUEST",
              );
              return;
            }

            const baseDate = nextPaymentDate
              ? this.mtzService.mtz(nextPaymentDate)
              : this.mtzService.mtz();

            const installmentNextPaymentDate = baseDate
              .add(1, "month")
              .toDate();

            const recurringPaymentDay = installmentNextPaymentDate.getDate();

            const totalDownPaymentBalanceAfterAmount =
              totalDownPaymentBalance - amount;

            const isDownPaymentBalanceZero =
              totalDownPaymentBalanceAfterAmount <= 0;

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
                recurringPaymentDay,
                nextPaymentDate: installmentNextPaymentDate,
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

            const baseDate = nextPaymentDate
              ? this.mtzService.mtz(nextPaymentDate)
              : this.mtzService.mtz();

            const installmentNextPaymentDate = baseDate
              .add(1, "month")
              .toDate();

            const recurringPaymentDay = installmentNextPaymentDate.getDate();

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
                recurringPaymentDay,
                nextPaymentDate: installmentNextPaymentDate,
                totalDownPaymentBalance: 0,
                downPaymentStatus: "DONE",
              },
            });
          } else if (
            downPaymentStatus === "DONE" &&
            status === "ON_GOING" &&
            totalMonthly
          ) {
            if (amount < totalMonthly) {
              this.exceptionService.throw(
                `Amount must be greater than or equal to ${totalMonthly}`,
                "BAD_REQUEST",
              );
              return;
            }

            if (transactionType !== "MONTHLY_PAYMENT") {
              this.exceptionService.throw(
                "Payment must be for MONTHLY_PAYMENT on this transaction",
                "BAD_REQUEST",
              );
              return;
            }

            const computedBalance = balance - amount;
            const totalBalanceAfterAmount =
              computedBalance <= 0 ? 0 : balance - amount;

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
                balance: totalBalanceAfterAmount,
                ...(!totalBalanceAfterAmount && { status: "DONE" }),
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
}
