import { Injectable } from "@nestjs/common";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { UserFullDetailsProps } from "src/type";
import { ApproveRequestDto, RejectDeleteRequestDto } from "./dto";
import { $Enums, Prisma } from "generated/prisma";
import { CreateUpdateClientDto } from "src/client/dto";
import { QuerySearchDto } from "src/dto";

type ModuleResponseProps = {
  targetId: string;
  requestType: $Enums.REQUEST_TYPE;
  status: $Enums.REQUEST_STATUS;
  approvedBy?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  dateCreated: string;
  dateUpdated: string;
  dateDeleted?: string;
  rejectedBy?: string;
  dateRejected?: string;
  dateApproved?: string;
  [key: string]: any;
};

@Injectable()
export class RequestService {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
  ) {}

  private moduleList: $Enums.REQUEST_MODULE[] = [
    $Enums.REQUEST_MODULE.CLIENT,
    $Enums.REQUEST_MODULE.AGENT_COMMISSION,
    $Enums.REQUEST_MODULE.CONTRACT,
    $Enums.REQUEST_MODULE.FILE,
    $Enums.REQUEST_MODULE.PAYMENT,
    $Enums.REQUEST_MODULE.RESERVATION,
  ];

  private moduleModel: Record<$Enums.REQUEST_MODULE, string> = {
    [$Enums.REQUEST_MODULE.CLIENT]: "clientRequest",
    [$Enums.REQUEST_MODULE.RESERVATION]: "reservationRequest",
    [$Enums.REQUEST_MODULE.CONTRACT]: "contractRequest",
    [$Enums.REQUEST_MODULE.PAYMENT]: "paymentRequest",
    [$Enums.REQUEST_MODULE.AGENT_COMMISSION]: "agentCommissionRequest",
    [$Enums.REQUEST_MODULE.FILE]: "fileRequest",
  };

  private moduleModelSearch: Record<
    $Enums.REQUEST_MODULE,
    (search: string, searchArr: string[]) => any
  > = {
    [$Enums.REQUEST_MODULE.CLIENT]: (search, searchArr) => [
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
    ],
    [$Enums.REQUEST_MODULE.RESERVATION]: (search, searchArr) => [
      {
        payment: {
          reservation: {
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
        },
      },
    ],
    [$Enums.REQUEST_MODULE.CONTRACT]: (search, searchArr) => [
      {
        contract: {
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
      },
    ],
    [$Enums.REQUEST_MODULE.PAYMENT]: (search, searchArr) => [
      {
        payment: {
          OR: [
            {
              reservation: {
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
            },
            {
              contract: {
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
            },
          ],
        },
      },
    ],
    [$Enums.REQUEST_MODULE.AGENT_COMMISSION]: (search, searchArr) => [
      {
        agent: {
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
    ],
    [$Enums.REQUEST_MODULE.FILE]: (search, searchArr) => [
      {
        file: {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              name: {
                in: searchArr,
                mode: "insensitive",
              },
            },
          ],
        },
      },
    ],
  };

  private targetModuleModel: Record<$Enums.REQUEST_MODULE, string> = {
    [$Enums.REQUEST_MODULE.CLIENT]: "client",
    [$Enums.REQUEST_MODULE.RESERVATION]: "payment",
    [$Enums.REQUEST_MODULE.CONTRACT]: "contract",
    [$Enums.REQUEST_MODULE.PAYMENT]: "payment",
    [$Enums.REQUEST_MODULE.AGENT_COMMISSION]: "agentCommission",
    [$Enums.REQUEST_MODULE.FILE]: "file",
  };

  private requestTypeModel: Record<$Enums.REQUEST_TYPE, string> = {
    [$Enums.REQUEST_TYPE.ADD]: "create",
    [$Enums.REQUEST_TYPE.UPDATE]: "update",
    [$Enums.REQUEST_TYPE.DELETE]: "update",
  };

  private moduleStatus: Record<
    $Enums.REQUEST_REJECT_DELETE,
    $Enums.REQUEST_STATUS
  > = {
    [$Enums.REQUEST_REJECT_DELETE.DELETE]: $Enums.REQUEST_STATUS.DELETED,
    [$Enums.REQUEST_REJECT_DELETE.REJECT]: $Enums.REQUEST_STATUS.REJECTED,
  };

  private moduleMessage: Record<$Enums.REQUEST_REJECT_DELETE, string> = {
    [$Enums.REQUEST_REJECT_DELETE.DELETE]: "deleted",
    [$Enums.REQUEST_REJECT_DELETE.REJECT]: "rejected",
  };

  async approveRequest(
    requestId: string,
    dto: ApproveRequestDto,
    user?: UserFullDetailsProps,
  ) {
    const { module } = dto;
    try {
      await this.prismaService.$transaction(async prisma => {
        const moduleResponse = await prisma[this.moduleModel[module]].findFirst(
          {
            where: {
              AND: [
                {
                  id: requestId,
                },
                {
                  status: { notIn: ["DELETED", "REJECTED", "APPROVED"] },
                },
              ],
            },
          },
        );

        if (!moduleResponse || !moduleResponse.targetId) {
          this.exceptionService.throw(
            "Module request not found, its either deleted, rejected or approved",
            "NOT_FOUND",
          );
          return;
        }

        const {
          targetId,
          requestType,
          status,
          dateCreated,
          dateUpdated,
          dateDeleted,
          approvedBy,
          createdBy,
          updatedBy,
          deletedBy,
          rejectedBy,
          dateRejected,
          dateApproved,
          ...rest
        } = moduleResponse as ModuleResponseProps;

        const isRequestUpdateOrDelete =
          requestType === $Enums.REQUEST_TYPE.UPDATE ||
          requestType === $Enums.REQUEST_TYPE.DELETE;

        const isRequestDelete = requestType === $Enums.REQUEST_TYPE.DELETE;

        await prisma[this.targetModuleModel[module]][
          this.requestTypeModel[requestType]
        ]({
          ...(isRequestUpdateOrDelete
            ? {
                where: {
                  id: targetId,
                },
                data: {
                  ...(isRequestDelete
                    ? { status: "DELETED", deletedBy: user?.id }
                    : { ...rest, updatedBy: user?.id }),
                },
              }
            : {
                data: {
                  ...rest,
                  createdBy: user?.id,
                },
              }),
        });

        await prisma[this.moduleModel[module]].update({
          where: {
            id: requestId,
          },
          data: {
            status: "APPROVED",
            approvedBy: user?.id,
            updatedBy: user?.id,
          },
        });

        // ? this query is specific for reservation and payment only
        if (module === "RESERVATION" && isRequestDelete) {
          const reservationPaymentResponse = await prisma.payment.findUnique({
            where: {
              id: targetId,
            },
            include: {
              reservation: true,
            },
          });

          if (
            !reservationPaymentResponse ||
            !reservationPaymentResponse.reservation
          ) {
            this.exceptionService.throw(
              "Payment not found for reservation",
              "NOT_FOUND",
            );
            return;
          }

          await prisma.reservation.update({
            where: {
              id: reservationPaymentResponse.reservation.id,
            },
            data: {
              status: "DELETED",
              deletedBy: user?.id,
            },
          });
        }
        // ?
      });

      return `Request for module ${module} has been approved.`;
    } catch (error) {
      throw error;
    }
  }

  async rejectOrDeleteRequest(
    dto: RejectDeleteRequestDto,
    requestId: string,
    user?: UserFullDetailsProps,
  ) {
    const { module, requestType } = dto;
    try {
      await this.prismaService[this.moduleModel[module]].update({
        where: {
          id: requestId,
        },
        data: {
          status: this.moduleStatus[requestType],
          ...(requestType === $Enums.REQUEST_REJECT_DELETE.REJECT
            ? { rejectedBy: user?.id }
            : { deletedBy: user?.id }),
        },
      });

      return `Request for module ${module} has been ${this.moduleMessage[requestType]}.`;
    } catch (error) {
      throw error;
    }
  }

  async getRequestList(
    module: $Enums.REQUEST_MODULE,
    query: QuerySearchDto,
    _user?: UserFullDetailsProps,
  ) {
    let response = [];
    try {
      const { search } = query || {};
      await this.prismaService.$transaction(async prisma => {
        if (!this.moduleList.includes(module)) {
          this.exceptionService.throw(
            `Module must be one of the following: ${this.moduleList}`,
            "BAD_REQUEST",
          );
          return;
        }

        const searchArr = search?.split(" ") || [];
        const whereQuery = {
          status: { not: "DELETED" },
          ...(search && {
            OR: this.moduleModelSearch[module](search, searchArr),
          }),
        };
        const moduleResponse = await prisma[this.moduleModel[module]].findMany({
          where: whereQuery,
          omit: {
            dateDeleted: true,
          },
        });

        if (!moduleResponse.length) {
          return;
        }

        const formattedModuleResponse = await Promise.all(
          moduleResponse.map(async ({ targetId, ...rest }) => {
            const targetResponse = await prisma[
              this.targetModuleModel[module]
            ].findFirst({
              where: {
                AND: [
                  {
                    id: targetId,
                  },
                  {
                    status: { not: "DELETED" },
                  },
                ],
              },
            });

            return { ...rest, targetId, target: targetResponse || {} };
          }),
        );

        response = formattedModuleResponse;
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateClientRequest(
    requestId: string,
    dto: CreateUpdateClientDto,
    user?: UserFullDetailsProps,
  ) {
    const {
      firstName,
      middleName,
      lastName,
      email,
      contactNumber,
      tinNumber,
      houseNumber,
      street,
      barangay,
      subdivision,
      city,
      province,
      region,
      zip,
    } = dto || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        const clientRequestResponse = await prisma.clientRequest.findFirst({
          where: {
            AND: [
              {
                id: requestId,
              },
              {
                status: "PENDING",
              },
            ],
          },
        });

        if (!clientRequestResponse) {
          this.exceptionService.throw(
            `Client request not found. request might be approved, rejected or deleted.`,
            "BAD_REQUEST",
          );
          return;
        }

        await prisma.clientRequest.update({
          where: {
            id: requestId,
          },
          data: {
            firstName,
            middleName,
            lastName,
            email,
            contactNumber,
            tinNumber,
            houseNumber,
            street,
            barangay,
            subdivision,
            city,
            province,
            region,
            zip,
            updatedBy: user?.id,
          },
        });
      });

      return "Client request has been updated.";
    } catch (error) {
      throw error;
    }
  }
}
