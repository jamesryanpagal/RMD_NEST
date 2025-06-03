import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ReservationDto } from "./dto";
import { MtzService } from "src/services/mtz/mtz.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";

@Injectable()
export class ReservationService {
  constructor(
    private prismaService: PrismaService,
    private mtzService: MtzService,
    private exceptionService: ExceptionService,
  ) {}

  async createReservation(
    lotId: string,
    clientId: string,
    dto: ReservationDto,
  ) {
    try {
      const {
        transactionType,
        modeOfPayment,
        paymentDate,
        amount,
        referenceNumber,
      } = dto || {};

      await this.prismaService.$transaction(async prisma => {
        const checkReservation = await prisma.reservation.findFirst({
          where: {
            AND: [
              {
                lotId,
              },
              {
                status: { in: ["ACTIVE", "DONE"] },
              },
            ],
          },
        });

        if (!!checkReservation) {
          this.exceptionService.throw(
            "Lot unavailable for reservation",
            "BAD_REQUEST",
          );
          return;
        }

        const reservationValidity = this.mtzService
          .mtz()
          .add(1, "week")
          .toDate();

        const paymentResponse = await prisma.payment.create({
          data: {
            transactionType,
            modeOfPayment,
            paymentDate,
            amount,
            referenceNumber,
          },
        });

        const reservationResponse = await prisma.reservation.create({
          data: {
            payment: {
              connect: {
                id: paymentResponse.id,
              },
            },
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
            validity: reservationValidity,
          },
        });

        await prisma.payment.update({
          where: {
            id: paymentResponse.id,
          },
          data: {
            reservation: {
              connect: {
                id: reservationResponse.id,
              },
            },
          },
        });
      });

      return "Reservation created successfully";
    } catch (error) {
      throw error;
    }
  }

  async getReservations() {
    try {
      let response: any[] = [];
      await this.prismaService.$transaction(async prisma => {
        const reservationList = await prisma.reservation.findMany({
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
            client: {
              omit: {
                dateCreated: true,
                dateUpdated: true,
                dateDeleted: true,
              },
            },
            payment: {
              omit: {
                dateCreated: true,
                dateUpdated: true,
                dateDeleted: true,
              },
            },
          },
        });

        const validatedResponse = await Promise.all(
          reservationList.map(async props => {
            const { id, validity, status } = props || {};
            const validityExpired = this.mtzService
              .mtz(validity)
              .isBefore(this.mtzService.mtz());

            if (validityExpired && status === "ACTIVE") {
              const updatedResponse = await prisma.reservation.update({
                where: { id },
                data: {
                  status: "FORFEITED",
                },
              });

              return { ...props, status: updatedResponse.status };
            }

            return props;
          }),
        );

        response = validatedResponse as any[];
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getReservation(id: string) {
    try {
      let respose: any | null = null;
      await this.prismaService.$transaction(async prisma => {
        const reservationResponse = await prisma.reservation.findFirst({
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
            client: {
              omit: {
                dateCreated: true,
                dateUpdated: true,
                dateDeleted: true,
              },
            },
            payment: {
              omit: {
                dateCreated: true,
                dateUpdated: true,
                dateDeleted: true,
              },
            },
          },
        });

        const { id: responseId, validity, status } = reservationResponse || {};

        const validityExpired = this.mtzService
          .mtz(validity)
          .isBefore(this.mtzService.mtz());

        if (validityExpired && status === "ACTIVE") {
          const updatedResponse = await prisma.reservation.update({
            where: { id: responseId },
            data: {
              status: "FORFEITED",
            },
          });

          respose = { ...reservationResponse, status: updatedResponse.status };
          return;
        }

        respose = reservationResponse;
      });

      return respose;
    } catch (error) {
      throw error;
    }
  }

  async deleteReservation(id: string) {
    try {
      await this.prismaService.reservation.update({
        where: {
          id,
        },
        data: {
          status: "DELETED",
        },
      });

      return "Reservation deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  async updateReservation(id: string, dto: ReservationDto) {
    try {
      const {
        transactionType,
        modeOfPayment,
        paymentDate,
        amount,
        referenceNumber,
      } = dto || {};

      await this.prismaService.$transaction(async prisma => {
        const reservationRespose = await prisma.reservation.findFirst({
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

        if (!reservationRespose) {
          this.exceptionService.throw("Reservation not found", "NOT_FOUND");
          return;
        }

        console.log({ modeOfPayment });

        await prisma.payment.update({
          where: {
            id: reservationRespose.payment?.id,
          },
          data: {
            transactionType,
            modeOfPayment,
            paymentDate,
            amount,
            referenceNumber,
          },
        });
      });

      return "Reservation updated successfully";
    } catch (error) {
      throw error;
    }
  }
}
