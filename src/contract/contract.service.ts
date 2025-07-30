import { Injectable } from "@nestjs/common";
import { CreateUpdateContractDto } from "./dto";
import { PrismaService } from "src/services/prisma/prisma.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";

@Injectable()
export class ContractService {
  constructor(
    private prismaService: PrismaService,
    private mtzService: MtzService,
    private exceptionService: ExceptionService,
  ) {}

  async createContract(
    clientId: string,
    lotId: string,
    agentId: string,
    dto: CreateUpdateContractDto,
  ) {
    const {
      downPaymentType,
      downPayment,
      downPaymentTerms,
      miscellaneous,
      miscellaneousTotal,
      agentCommission,
      agentCommissionTotal,
      tcp,
      sqmPrice,
      terms,
      paymentType,
      totalLotPrice,
    } = dto || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        const contractResponse = await prisma.contract.create({
          data: {
            sqmPrice,
            miscellaneous,
            miscellaneousTotal,
            agent: {
              connect: {
                id: agentId,
              },
            },
            agentCommission,
            agentCommissionTotal,
            paymentType,
            balance: 0,
            totalLotPrice,
            tcp,
            lot: {
              connect: {
                id: lotId,
              },
            },
            client: {
              connect: {
                id: clientId,
              },
            },
          },
        });

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
                status: "ACTIVE",
              },
            ],
          },
          include: {
            payment: true,
          },
        });

        if (!reservationFee) {
          this.exceptionService.throw(
            "Cannot create contract for this client. please check if it has reservation for the given lot",
            "BAD_REQUEST",
          );
          return;
        }

        const {
          id: reservationId,
          validity,
          payment: reservationPayment,
        } = reservationFee || {};

        const reservationFeeValidityExpired = this.mtzService
          .mtz(validity)
          .isBefore(this.mtzService.mtz());

        if (reservationFeeValidityExpired) {
          this.exceptionService.throw(
            "Reservation fee validity expired",
            "BAD_REQUEST",
          );
          return;
        }

        await prisma.reservation.update({
          where: {
            id: reservationId,
          },
          data: {
            status: "DONE",
          },
        });

        const baseDate = this.mtzService.mtz(undefined, "dateTimeUTCZ");

        if (paymentType === "INSTALLMENT") {
          if (downPayment && terms) {
            const totalDownPayment = tcp * (downPayment / 100);
            const totalDownPaymentAfterReservation =
              totalDownPayment - (reservationPayment?.amount || 0);
            const balance = tcp - totalDownPayment;

            const computedTerms =
              terms +
              (downPaymentType === "FULL_DOWN_PAYMENT"
                ? 1
                : downPaymentTerms || 0);

            const nextPaymentDate = baseDate.clone();
            const lastPaymentDate = baseDate.clone();
            const recurringPaymentDay = baseDate.toDate().getDate();

            for (let index = 1; index < computedTerms; index++) {
              lastPaymentDate.add(1, "month").set("date", recurringPaymentDay);
            }

            const formattedNextPaymentDate = nextPaymentDate.format(
              this.mtzService.dateFormat.dateTimeUTCZ,
            );
            const formattedLastPaymentDate = lastPaymentDate.format(
              this.mtzService.dateFormat.dateTimeUTCZ,
            );

            await prisma.contract.update({
              where: {
                id: contractResponse.id,
              },
              data: {
                balance,
                nextPaymentDate: formattedNextPaymentDate,
                recurringPaymentDay,
                paymentStartedDate: formattedNextPaymentDate,
                paymentLastDate: formattedLastPaymentDate,
                totalDownPayment,
                totalDownPaymentBalance: totalDownPaymentAfterReservation,
                downPayment,
                downPaymentType,
                downPaymentTerms,
                terms,
                ...(downPaymentType === "PARTIAL_DOWN_PAYMENT" &&
                downPaymentTerms
                  ? {
                      totalMonthlyDown: Number(
                        (
                          totalDownPaymentAfterReservation / downPaymentTerms
                        ).toFixed(2),
                      ),
                    }
                  : downPaymentType === "FULL_DOWN_PAYMENT"
                    ? {
                        totalMonthlyDown: Number(
                          totalDownPaymentAfterReservation.toFixed(2),
                        ),
                      }
                    : {}),
                downPaymentStatus: "ON_GOING",
                totalMonthly: Number((balance / terms).toFixed(2)),
              },
            });
          }
        } else {
          const cashComputedBalance = tcp - (reservationPayment?.amount || 0);
          const formattedBaseDate = baseDate
            .clone()
            .format(this.mtzService.dateFormat.dateTimeUTCZ);
          await prisma.contract.update({
            where: {
              id: contractResponse.id,
            },
            data: {
              paymentStartedDate: formattedBaseDate,
              paymentLastDate: formattedBaseDate,
              balance: cashComputedBalance,
              totalCashPayment: cashComputedBalance,
            },
          });
        }

        await prisma.lot.update({
          where: {
            id: lotId,
          },
          data: {
            status: "ON_GOING",
          },
        });
      });

      return "Contract Created";
    } catch (error) {
      throw error;
    }
  }

  async getContract(id: string) {
    try {
      const contractResponse = await this.prismaService.contract.findFirst({
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
        omit: {
          dateCreated: true,
          dateUpdated: true,
          dateDeleted: true,
        },
        include: {
          lot: {
            omit: {
              status: true,
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
            },
          },
          client: {
            omit: {
              status: true,
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
            },
          },
          payment: {
            omit: {
              status: true,
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
            },
          },
        },
      });

      const reservation = await this.prismaService.reservation.findFirst({
        where: {
          AND: [
            {
              clientId: contractResponse?.clientId,
            },
            {
              status: { in: ["ACTIVE", "DONE"] },
            },
          ],
        },
        include: {
          payment: {
            omit: {
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
            },
          },
        },
      });

      return {
        ...contractResponse,
        payment: reservation
          ? [reservation.payment, ...(contractResponse?.payment || [])]
          : contractResponse?.payment || [],
      };
    } catch (error) {
      throw error;
    }
  }

  async getContracts() {
    try {
      const contractsResponse = await this.prismaService.contract.findMany({
        where: {
          status: { not: "DELETED" },
        },
        omit: {
          dateCreated: true,
          dateUpdated: true,
          dateDeleted: true,
        },
        include: {
          lot: {
            omit: {
              status: true,
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
            },
          },
          payment: {
            include: {
              reservation: {
                omit: {
                  dateCreated: true,
                  dateUpdated: true,
                  dateDeleted: true,
                },
              },
            },
            omit: {
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
            },
          },
          client: {
            omit: {
              status: true,
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
            },
          },
        },
      });

      const formattedContractsResponse = await Promise.all(
        contractsResponse.map(async ({ clientId, payment, ...rest }) => {
          const reservation = await this.prismaService.reservation.findFirst({
            where: {
              AND: [
                {
                  clientId,
                },
                {
                  status: { in: ["ACTIVE", "DONE"] },
                },
              ],
            },
            include: {
              payment: {
                omit: {
                  dateCreated: true,
                  dateUpdated: true,
                  dateDeleted: true,
                },
              },
            },
          });

          return {
            clientId,
            ...rest,
            payment: reservation ? [reservation.payment, ...payment] : payment,
          };
        }),
      );

      return formattedContractsResponse;
    } catch (error) {
      throw error;
    }
  }

  // async updateContract(id: string, dto: CreateUpdateContractDto) {
  //   const {
  //     agentId,
  //     downPayment,
  //     miscellaneous,
  //     miscellaneousTotal,
  //     agentCommission,
  //     agentCommissionTotal,
  //     tcp,
  //     sqmPrice,
  //     terms,
  //     paymentType,
  //     totalLotPrice,
  //   } = dto || {};
  //   try {
  //     await this.prismaService.contract.update({
  //       where: {
  //         id,
  //       },
  //       data: {
  //         sqmPrice,
  //         downPayment,
  //         terms,
  //         miscellaneous,
  //         miscellaneousTotal,
  //         agent: {
  //           connect: {
  //             id: agentId,
  //           },
  //         },
  //         agentCommission,
  //         agentCommissionTotal,
  //         paymentType,
  //         balance: tcp,
  //         totalLotPrice,
  //         tcp,
  //       },
  //     });

  //     return "Contract Updated";
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async deleteContract(id: string) {
    try {
      await this.prismaService.contract.update({
        where: {
          id,
        },
        data: {
          status: "DELETED",
        },
      });

      return "Contract Deleted";
    } catch (error) {
      throw error;
    }
  }
}
