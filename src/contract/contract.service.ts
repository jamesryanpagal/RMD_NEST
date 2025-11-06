import { Injectable } from "@nestjs/common";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { CreateUpdateContractDto, UpdatePaymentStartDateDto } from "./dto";
import { UserFullDetailsProps } from "src/type";
import { QuerySearchDto } from "src/dto";
import { Prisma } from "generated/prisma";
import { ReservationService } from "src/reservation/reservation.service";

@Injectable()
export class ContractService {
  constructor(
    private prismaService: PrismaService,
    private mtzService: MtzService,
    private exceptionService: ExceptionService,
    private reservationService: ReservationService,
  ) {}

  async createContract(
    clientId: string,
    lotId: string,
    agentId: string,
    dto: CreateUpdateContractDto,
    user?: UserFullDetailsProps,
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
      interest,
      installmentType,
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
            createdBy: user?.id,
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

        const { expired } =
          await this.reservationService.onValidateReservationValidity(
            reservationFee,
          );

        if (expired) {
          this.exceptionService.throw(
            "Reservation fee validity expired. Please create a new reservation.",
            "BAD_REQUEST",
          );
          return;
        }

        const {
          id: reservationId,
          validity,
          payment: reservationPayment,
        } = reservationFee || {};

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

        const baseDateValue = paymentStartDate
          ? this.mtzService
              .mtz(paymentStartDate, "defaultformat")
              .format(this.mtzService.dateFormat.dateTimeUTCZ)
          : formattedReservationValidityDate
              .add(1, "week")
              .format(this.mtzService.dateFormat.dateTimeUTCZ);

        const baseDate = this.mtzService.mtz(baseDateValue, "dateTimeUTCZ");

        if (paymentType === "INSTALLMENT") {
          const hasInterest =
            interest !== null &&
            interest !== undefined &&
            installmentType === "STRAIGHT_MONTHLY_PAYMENT";

          const initialTerms = terms || 0;

          const nextPaymentDate = baseDate.clone();
          const recurringPaymentDay = baseDate.toDate().getDate();

          const formattedNextPaymentDate = nextPaymentDate.format(
            this.mtzService.dateFormat.dateTimeUTCZ,
          );

          if (hasInterest) {
            const computedTlp = totalLotPrice + miscellaneousTotal;
            const interestTotal = computedTlp * (interest / 100);

            const totalTcp = computedTlp + interestTotal;
            const balance = totalTcp - (reservationPayment?.amount || 0);

            const lastPaymentDate = this.mtzService.onCalculateLastDate(
              baseDate.clone(),
              initialTerms,
              recurringPaymentDay,
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
                terms,
                installmentType,
                interest,
                interestTotal,
                totalMonthly: Number((balance / initialTerms).toFixed(2)),
                createdBy: user?.id,
              },
            });
          } else if (downPayment && terms) {
            const totalDownPayment = tcp * (downPayment / 100);
            const totalDownPaymentAfterReservation =
              totalDownPayment - (reservationPayment?.amount || 0);
            const balance = tcp - totalDownPayment;

            const computedTerms =
              initialTerms +
              (downPaymentType === "FULL_DOWN_PAYMENT"
                ? 1
                : downPaymentTerms || 0);

            const lastPaymentDate = this.mtzService.onCalculateLastDate(
              baseDate.clone(),
              computedTerms,
              recurringPaymentDay,
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
                createdBy: user?.id,
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
              createdBy: user?.id,
            },
          });
        }

        await prisma.lot.update({
          where: {
            id: lotId,
          },
          data: {
            status: "ON_GOING",
            updatedBy: user?.id,
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
            createdBy: user?.id,
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

  async getContracts(query: QuerySearchDto) {
    try {
      const { search } = query || {};
      const searchArr = search?.split(" ") || [];
      const whereQuery: Prisma.ContractWhereInput = {
        status: { not: "DELETED" },
        ...(search && {
          OR: [
            {
              client: {
                OR: [
                  {
                    firstName: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    middleName: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    lastName: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    firstName: {
                      in: searchArr,
                      mode: "insensitive",
                    },
                  },
                  {
                    middleName: {
                      in: searchArr,
                      mode: "insensitive",
                    },
                  },
                  {
                    lastName: {
                      in: searchArr,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            },
            {
              lot: {
                block: {
                  phase: {
                    project: {
                      OR: [
                        {
                          projectName: {
                            contains: search,
                            mode: "insensitive",
                          },
                        },
                        {
                          projectName: {
                            in: searchArr,
                            mode: "insensitive",
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          ],
        }),
      };
      const contractsResponse = await this.prismaService.contract.findMany({
        where: whereQuery,
        omit: {
          dateCreated: true,
          dateUpdated: true,
          dateDeleted: true,
        },
        orderBy: {
          dateCreated: "desc",
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

  async deleteContract(id: string, user?: UserFullDetailsProps) {
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
                id,
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

        const { role } = user || {};

        const {
          paymentType,
          terms,
          downPaymentTerms,
          downPaymentType,
          dateCreated,
          dateDeleted,
          dateUpdated,
          sqmPrice,
          downPaymentStatus,
          totalMonthlyDown,
          totalMonthly,
          downPayment,
          totalDownPayment,
          totalDownPaymentBalance,
          miscellaneous,
          miscellaneousTotal,
          agentCommission,
          agentCommissionTotal,
          balance,
          totalLotPrice,
          tcp,
          totalCashPayment,
          penaltyAmount,
          penaltyCount,
          excessPayment,
          paymentStartedDate,
          nextPaymentDate,
          recurringPaymentDay,
          paymentLastDate,
        } = contractResponse || {};

        if (role === "SECRETARY") {
          await prisma.contractRequest.create({
            data: {
              paymentType,
              terms,
              downPaymentTerms,
              downPaymentType,
              dateCreated,
              dateDeleted,
              dateUpdated,
              sqmPrice,
              downPaymentStatus,
              totalMonthlyDown,
              totalMonthly,
              downPayment,
              totalDownPayment,
              totalDownPaymentBalance,
              miscellaneous,
              miscellaneousTotal,
              agentCommission,
              agentCommissionTotal,
              balance,
              totalLotPrice,
              tcp,
              totalCashPayment,
              penaltyAmount,
              penaltyCount,
              excessPayment,
              paymentStartedDate,
              nextPaymentDate,
              recurringPaymentDay,
              paymentLastDate,
              requestType: "DELETE",
              createdBy: user.id,
              contract: {
                connect: {
                  id,
                },
              },
            },
          });
        } else {
          await prisma.contract.update({
            where: {
              id,
            },
            data: {
              status: "DELETED",
              deletedBy: user?.id,
            },
          });
        }
      });

      return "Contract deleted successfully.";
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
    user?: UserFullDetailsProps,
  ) {
    const { paymentStartDate } = dto || {};
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

        const parsedPaymentStartDate = this.mtzService.mtz(
          paymentStartDate,
          "defaultformat",
        );

        const formattedPaymentStartDate = parsedPaymentStartDate.format(
          this.mtzService.dateFormat.dateTimeUTCZ,
        );

        const { role } = user || {};

        const {
          payment,
          paymentType,
          terms,
          downPaymentTerms,
          downPaymentType,
          dateCreated,
          dateDeleted,
          dateUpdated,
          sqmPrice,
          downPaymentStatus,
          totalMonthlyDown,
          totalMonthly,
          downPayment,
          totalDownPayment,
          totalDownPaymentBalance,
          miscellaneous,
          miscellaneousTotal,
          agentCommission,
          agentCommissionTotal,
          balance,
          totalLotPrice,
          tcp,
          totalCashPayment,
          penaltyAmount,
          penaltyCount,
          excessPayment,
        } = contractResponse || {};

        if (!!payment && !!payment.length) {
          this.exceptionService.throw(
            "Cannot update payment start date, as payments already started",
            "BAD_REQUEST",
          );
          return;
        }

        const computedTerms =
          (terms || 0) +
          (downPaymentType === "FULL_DOWN_PAYMENT" ? 1 : downPaymentTerms || 0);

        const recurringPaymentDay = parsedPaymentStartDate.toDate().getDate();

        const lastPaymentDate = this.mtzService.onCalculateLastDate(
          parsedPaymentStartDate.clone(),
          computedTerms,
          recurringPaymentDay,
        );

        const formattedLastPaymentDate = lastPaymentDate.format(
          this.mtzService.dateFormat.dateTimeUTCZ,
        );

        if (role === "SECRETARY") {
          await prisma.contractRequest.create({
            data: {
              paymentType,
              terms,
              downPaymentTerms,
              downPaymentType,
              dateCreated,
              dateDeleted,
              dateUpdated,
              sqmPrice,
              downPaymentStatus,
              totalMonthlyDown,
              totalMonthly,
              downPayment,
              totalDownPayment,
              totalDownPaymentBalance,
              miscellaneous,
              miscellaneousTotal,
              agentCommission,
              agentCommissionTotal,
              balance,
              totalLotPrice,
              tcp,
              totalCashPayment,
              penaltyAmount,
              penaltyCount,
              excessPayment,
              ...(paymentType === "INSTALLMENT"
                ? {
                    paymentStartedDate: formattedPaymentStartDate,
                    nextPaymentDate: formattedPaymentStartDate,
                    recurringPaymentDay,
                    paymentLastDate: formattedLastPaymentDate,
                  }
                : {
                    paymentStartedDate: formattedPaymentStartDate,
                    paymentLastDate: formattedPaymentStartDate,
                  }),
              requestType: "UPDATE",
              createdBy: user.id,
              contract: {
                connect: {
                  id,
                },
              },
            },
          });
        } else {
          if (paymentType === "INSTALLMENT") {
            await prisma.contract.update({
              where: {
                id,
              },
              data: {
                paymentStartedDate: formattedPaymentStartDate,
                nextPaymentDate: formattedPaymentStartDate,
                recurringPaymentDay,
                paymentLastDate: formattedLastPaymentDate,
                updatedBy: user.id,
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
                updatedBy: user.id,
              },
            });
          }
        }
      });

      return "Contract Payment Start Date Updated";
    } catch (error) {
      throw error;
    }
  }

  async forfietContract(id: string, user?: UserFullDetailsProps) {
    try {
      await this.prismaService.$transaction(async prisma => {
        const contractResponse = await prisma.contract.findFirst({
          where: {
            AND: [
              {
                id,
              },
              {
                status: "ON_GOING",
              },
            ],
          },
          include: {
            commissionOfAgent: true,
            lot: {
              include: {
                reservation: {
                  where: {
                    status: "DONE",
                  },
                },
              },
            },
          },
        });

        if (!contractResponse) {
          this.exceptionService.throw(
            "Cannot forfeit contract, it is either deleted, forfeited or done.",
            "NOT_FOUND",
          );
          return;
        }

        const { commissionOfAgent, lotId, downPaymentStatus, lot } =
          contractResponse || {};
        const { reservation } = lot || {};

        await prisma.contract.update({
          where: {
            id,
          },
          data: {
            ...(downPaymentStatus === "ON_GOING"
              ? { downPaymentStatus: "FORFEITED", status: "FORFEITED" }
              : { status: "FORFEITED" }),
            updatedBy: user?.id,
          },
        });

        await prisma.agentCommission.update({
          where: {
            id: commissionOfAgent?.id,
          },
          data: {
            status: "CONTRACT_FORFEITED",
            updatedBy: user?.id,
          },
        });

        await Promise.all(
          reservation?.map(async ({ id: reservationId }) => {
            await prisma.reservation.update({
              where: {
                id: reservationId,
              },
              data: {
                status: "CONTRACT_FORFEITED",
                updatedBy: user?.id,
              },
            });
          }) || [],
        );

        await prisma.lot.update({
          where: {
            id: lotId,
          },
          data: {
            status: "OPEN",
            updatedBy: user?.id,
          },
        });
      });

      return "Contract forfeited successfully.";
    } catch (error) {
      throw error;
    }
  }
}
