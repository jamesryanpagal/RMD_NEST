/* eslint-disable no-useless-catch */
import { Injectable } from "@nestjs/common";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { CreateUpdateContractDto, UpdatePaymentStartDateDto } from "./dto";

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
      paymentStartDate,
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

        const formattedReservationValidityDate = this.mtzService.mtz(
          validity,
          "dateTimeUTCZ",
        );

        const baseDateValue = !!paymentStartDate
          ? this.mtzService
              .mtz(paymentStartDate, "defaultformat")
              .format(this.mtzService.dateFormat.dateTimeUTCZ)
          : formattedReservationValidityDate
              .add(1, "week")
              .format(this.mtzService.dateFormat.dateTimeUTCZ);

        const baseDate = this.mtzService.mtz(baseDateValue, "dateTimeUTCZ");

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
            const recurringPaymentDay = baseDate.toDate().getDate();
            const lastPaymentDate = this.mtzService.onCalculateLastDate(
              baseDate.clone(),
              computedTerms,
              recurringPaymentDay,
            );

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

        await prisma.agentCommission.create({
          data: {
            agent: {
              connect: {
                id: agentId,
              },
            },
            contract: {
              connect: {
                id: contractResponse.id,
              },
            },
            balance: agentCommissionTotal,
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
          agent: {
            omit: {
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
              status: true,
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
            include: {
              block: {
                include: {
                  phase: {
                    include: {
                      project: {
                        omit: {
                          status: true,
                          dateCreated: true,
                          dateUpdated: true,
                          dateDeleted: true,
                        },
                      },
                    },
                    omit: {
                      status: true,
                      dateCreated: true,
                      dateUpdated: true,
                      dateDeleted: true,
                    },
                  },
                },
                omit: {
                  status: true,
                  dateCreated: true,
                  dateUpdated: true,
                  dateDeleted: true,
                },
              },
            },
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
          agent: {
            omit: {
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
              status: true,
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

  async getAgentContracts(agentId: string) {
    try {
      return await this.prismaService.contract.findMany({
        where: {
          AND: [
            {
              agentId,
            },
            {
              status: { not: "DELETED" },
            },
          ],
        },
        include: {
          lot: {
            select: {
              id: true,
              title: true,
              sqm: true,
              block: {
                select: {
                  id: true,
                  title: true,
                  phase: {
                    select: {
                      id: true,
                      title: true,
                      project: {
                        select: {
                          id: true,
                          projectName: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          agent: {
            omit: {
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
              status: true,
            },
          },
          commissionOfAgent: {
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
      });
    } catch (error) {
      throw error;
    }
  }

  async getAgentContract(contractId: string) {
    try {
      return await this.prismaService.contract.findFirst({
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
          lot: {
            select: {
              id: true,
              title: true,
              sqm: true,
              block: {
                select: {
                  id: true,
                  title: true,
                  phase: {
                    select: {
                      id: true,
                      title: true,
                      project: {
                        select: {
                          id: true,
                          projectName: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          agent: {
            omit: {
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
              status: true,
            },
          },
          commissionOfAgent: {
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
      });
    } catch (error) {
      throw error;
    }
  }

  async updateContractPaymentStartDate(
    id: string,
    dto: UpdatePaymentStartDateDto,
  ) {
    const { paymentStartDate } = dto || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        const contractResponse = await prisma.contract.findFirst({
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
            payment: true,
          },
        });

        if (!contractResponse) {
          this.exceptionService.throw("Contract not found", "NOT_FOUND");
          return;
        }

        const {
          payment,
          paymentType,
          terms,
          downPaymentTerms,
          downPaymentType,
        } = contractResponse || {};

        if (!!payment && !!payment.length) {
          this.exceptionService.throw(
            "Cannot update payment start date, as payments already started",
            "BAD_REQUEST",
          );
          return;
        }

        const parsedPaymentStartDate = this.mtzService.mtz(
          paymentStartDate,
          "defaultformat",
        );

        const formattedPaymentStartDate = parsedPaymentStartDate.format(
          this.mtzService.dateFormat.dateTimeUTCZ,
        );

        if (paymentType === "INSTALLMENT" && terms) {
          const computedTerms =
            terms +
            (downPaymentType === "FULL_DOWN_PAYMENT"
              ? 1
              : downPaymentTerms || 0);

          const recurringPaymentDay = parsedPaymentStartDate.toDate().getDate();

          const lastPaymentDate = this.mtzService.onCalculateLastDate(
            parsedPaymentStartDate.clone(),
            computedTerms,
            recurringPaymentDay,
          );

          const formattedLastPaymentDate = lastPaymentDate.format(
            this.mtzService.dateFormat.dateTimeUTCZ,
          );

          await prisma.contract.update({
            where: {
              id,
            },
            data: {
              paymentStartedDate: formattedPaymentStartDate,
              nextPaymentDate: formattedPaymentStartDate,
              recurringPaymentDay,
              paymentLastDate: formattedLastPaymentDate,
            },
          });
        } else {
          await prisma.contract.update({
            where: {
              id,
            },
            data: {
              paymentStartedDate: formattedPaymentStartDate,
              paymentLastDate: formattedPaymentStartDate,
            },
          });
        }
      });

      return "Contract Payment Start Date Updated";
    } catch (error) {
      throw error;
    }
  }
}
