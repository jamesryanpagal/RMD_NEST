import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ReservationDto } from "./dto";
import { MtzService } from "src/services/mtz/mtz.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PaymentService } from "src/payment/payment.service";
import { UploadService } from "src/services/upload/upload.service";
import { FileService } from "src/file/file.service";
import { UserFullDetailsProps } from "src/type";

@Injectable()
export class ReservationService {
  constructor(
    private prismaService: PrismaService,
    private mtzService: MtzService,
    private exceptionService: ExceptionService,
    private paymentService: PaymentService,
    private uploadService: UploadService,
    private fileService: FileService,
  ) {}

  async createReservation(
    lotId: string,
    clientId: string,
    dto: ReservationDto,
    files: Express.Multer.File[],
    user?: UserFullDetailsProps,
  ) {
    try {
      const { modeOfPayment, paymentDate, amount, referenceNumber } = dto || {};

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
            transactionType: "RESERVATION_FEE",
            modeOfPayment,
            paymentDate,
            amount,
            referenceNumber,
          },
        });

        await this.paymentService.uploadPfp(
          paymentResponse.id,
          files,
          user,
          prisma,
        );

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

        await prisma.lot.update({
          where: {
            id: lotId,
          },
          data: {
            status: "PENDING",
          },
        });
      });

      return "Reservation created successfully";
    } catch (error) {
      this.uploadService.rollBackFiles(files);
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
              include: {
                files: {
                  where: {
                    status: { not: "DELETED" },
                  },
                  omit: {
                    dateCreated: true,
                    dateUpdated: true,
                    dateDeleted: true,
                    status: true,
                  },
                },
              },
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
            const { id, validity, status, payment } = props || {};
            const { files } = payment || {};
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

              return { ...props, payment, status: updatedResponse.status };
            }

            return {
              ...props,
              payment: {
                ...payment,
                files: this.fileService.onFormatPaymentFilesResponse(files),
              },
            };
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
              include: {
                files: {
                  where: {
                    status: { not: "DELETED" },
                  },
                  omit: {
                    dateCreated: true,
                    dateUpdated: true,
                    dateDeleted: true,
                    status: true,
                  },
                },
              },
              omit: {
                dateCreated: true,
                dateUpdated: true,
                dateDeleted: true,
              },
            },
          },
        });

        const {
          id: responseId,
          validity,
          status,
          payment,
        } = reservationResponse || {};
        const { files } = payment || {};

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

          respose = {
            ...reservationResponse,
            payment,
            status: updatedResponse.status,
          };
          return;
        }

        respose = {
          ...reservationResponse,
          payment: {
            ...payment,
            files: this.fileService.onFormatPaymentFilesResponse(files),
          },
        };
      });

      return respose;
    } catch (error) {
      throw error;
    }
  }

  async deleteReservation(id: string, user?: UserFullDetailsProps) {
    try {
      if (!user) {
        this.exceptionService.throw("User not found", "BAD_REQUEST");
        return;
      }

      const { role } = user || {};

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
          include: {
            payment: true,
          },
        });

        if (!reservationResponse || !reservationResponse.payment) {
          this.exceptionService.throw("Reservation not found", "NOT_FOUND");
          return;
        }

        if (role === "SECRETARY") {
          const { modeOfPayment, paymentDate, amount, referenceNumber } =
            reservationResponse.payment;

          await prisma.reservationRequest.create({
            data: {
              modeOfPayment,
              paymentDate,
              amount,
              referenceNumber,
              requestType: "DELETE",
              createdBy: user.id,
              payment: {
                connect: {
                  id: reservationResponse.payment.id,
                },
              },
            },
          });
        } else {
          await prisma.reservation.update({
            where: {
              id,
            },
            data: {
              status: "DELETED",
            },
          });

          await prisma.payment.update({
            where: {
              id: reservationResponse.payment.id,
            },
            data: {
              status: "DELETED",
            },
          });
        }
      });

      return "Reservation deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  async updateReservation(
    id: string,
    dto: ReservationDto,
    user?: UserFullDetailsProps,
  ) {
    try {
      const { modeOfPayment, paymentDate, amount, referenceNumber } = dto || {};

      await this.prismaService.$transaction(async prisma => {
        if (!user) {
          this.exceptionService.throw("User not found", "BAD_REQUEST");
          return;
        }

        const { role } = user || {};

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
          include: {
            payment: true,
          },
        });

        if (!reservationResponse) {
          this.exceptionService.throw("Reservation not found", "NOT_FOUND");
          return;
        }

        if (role === "SECRETARY") {
          await prisma.reservationRequest.create({
            data: {
              modeOfPayment,
              paymentDate,
              amount,
              referenceNumber,
              requestType: "UPDATE",
              createdBy: user.id,
              payment: {
                connect: {
                  id: reservationResponse.payment?.id,
                },
              },
            },
          });
        } else {
          await prisma.payment.update({
            where: {
              id: reservationResponse.payment?.id,
            },
            data: {
              modeOfPayment,
              paymentDate,
              amount,
              referenceNumber,
            },
          });
        }
      });

      return "Reservation updated successfully";
    } catch (error) {
      throw error;
    }
  }
}
