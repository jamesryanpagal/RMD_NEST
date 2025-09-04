import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ReservationDto } from "./dto";
import { MtzService } from "src/services/mtz/mtz.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PaymentService } from "src/payment/payment.service";
import { UploadService } from "src/services/upload/upload.service";
import { FileService } from "src/file/file.service";
import { UserFullDetailsProps } from "src/type";
import { QuerySearchDto } from "src/dto";
import { Prisma } from "generated/prisma";

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
        const checkClientStatus = await this.prismaService.client.findFirst({
          where: {
            AND: [
              {
                id: clientId,
              },
              {
                status: { not: "DELETED" },
              },
            ],
          },
        });

        if (!checkClientStatus) {
          this.exceptionService.throw("User not found", "NOT_FOUND");
          return;
        }

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
            createdBy: user?.id,
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
            createdBy: user?.id,
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

  async getReservations(query: QuerySearchDto) {
    try {
      let response: any[] = [];
      await this.prismaService.$transaction(async prisma => {
        const { search } = query || {};
        const searchArr = search?.split(" ") || [];
        const whereQuery: Prisma.ReservationWhereInput = {
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
        const reservationList = await prisma.reservation.findMany({
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
            const { status, payment } = props || {};
            const { files } = payment || {};

            if (status === "ACTIVE") {
              const { expired } = await this.onValidateReservationValidity(
                props as any,
                prisma,
              );
              if (expired) {
                return {
                  ...props,
                  payment: {
                    ...payment,
                    files: this.fileService.onFormatPaymentFilesResponse(files),
                  },
                  status: "FORFEITED",
                };
              }
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
      let response: any | null = null;
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

        const { status, payment } = reservationResponse || {};
        const { files } = payment || {};

        if (status === "ACTIVE") {
          const { expired } = await this.onValidateReservationValidity(
            reservationResponse as any,
            prisma,
          );
          if (expired) {
            response = {
              ...reservationResponse,
              payment: {
                ...payment,
                files: this.fileService.onFormatPaymentFilesResponse(files),
              },
              status: "FORFEITED",
            };
            return;
          }
        }

        response = {
          ...reservationResponse,
          payment: {
            ...payment,
            files: this.fileService.onFormatPaymentFilesResponse(files),
          },
        };
      });

      return response;
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
              deletedBy: user.id,
            },
          });

          await prisma.payment.update({
            where: {
              id: reservationResponse.payment.id,
            },
            data: {
              status: "DELETED",
              updatedBy: user.id,
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
              updatedBy: user.id,
            },
          });
        }
      });

      return "Reservation updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async onValidateReservationValidity(
    data: Prisma.ReservationGetPayload<{}>,
    prisma?: Prisma.TransactionClient,
  ) {
    const transaction = prisma || this.prismaService;
    let response: { expired: boolean } = { expired: false };
    try {
      const { id, lotId, validity } = data || {};

      const formattedDateToday = this.mtzService
        .mtz()
        .format(this.mtzService.dateFormat.defaultformat);
      const formattedDateValidity = this.mtzService
        .mtz(validity, "dateTimeUTCZ")
        .format(this.mtzService.dateFormat.defaultformat);
      const validityExpired = this.mtzService
        .mtz(formattedDateToday)
        .isAfter(formattedDateValidity);

      if (validityExpired) {
        await transaction.reservation.update({
          where: {
            id,
          },
          data: {
            status: "FORFEITED",
          },
        });

        await transaction.lot.update({
          where: {
            id: lotId,
          },
          data: {
            status: "OPEN",
          },
        });
        response.expired = true;
      }

      return response;
    } catch (error) {
      throw error;
    }
  }
}
