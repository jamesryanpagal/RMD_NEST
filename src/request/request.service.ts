import { Injectable } from "@nestjs/common";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { UserFullDetailsProps } from "src/type";
import { ApproveRequestDto, RejectDeleteRequestDto } from "./dto";
import { $Enums } from "generated/prisma";
import { CreateUpdateClientDto } from "src/client/dto";

type ModuleResponseProps = {
  targetId: string;
  requestType: $Enums.REQUEST_TYPE;
  status: $Enums.REQUEST_STATUS;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  dateCreated: string;
  dateUpdated: string;
  dateDeleted?: string;
  [key: string]: any;
};

@Injectable()
export class RequestService {
  constructor(
    private prismaService: PrismaService,
    private exceptionService: ExceptionService,
  ) {}

  private moduleList: $Enums.REQUEST_MODULE[] = [$Enums.REQUEST_MODULE.CLIENT];

  private moduleModel: Record<$Enums.REQUEST_MODULE, string> = {
    [$Enums.REQUEST_MODULE.CLIENT]: "clientRequest",
  };

  private targetModuleModel: Record<$Enums.REQUEST_MODULE, string> = {
    [$Enums.REQUEST_MODULE.CLIENT]: "client",
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

  async approveClientUpdate(
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
          createdBy,
          updatedBy,
          deletedBy,
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
                  ...(isRequestDelete ? { status: "DELETED" } : rest),
                },
              }
            : {
                data: {
                  ...rest,
                },
              }),
        });

        await prisma[this.moduleModel[module]].update({
          where: {
            id: requestId,
          },
          data: {
            status: "APPROVED",
            updatedBy: user?.id,
          },
        });
      });

      return `Request for module ${module} has been approved.`;
    } catch (error) {
      console.log(error);
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
            ? { updatedBy: user?.id }
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
    user?: UserFullDetailsProps,
  ) {
    const { id } = user || {};
    let response = [];
    try {
      await this.prismaService.$transaction(async prisma => {
        if (!this.moduleList.includes(module)) {
          this.exceptionService.throw(
            `Module must be one of the following: ${this.moduleList}`,
            "BAD_REQUEST",
          );
          return;
        }
        const moduleResponse = await prisma[this.moduleModel[module]].findMany({
          where: {
            AND: [
              {
                createdBy: id,
              },
              {
                status: { not: "DELETED" },
              },
            ],
          },
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
              omit: {
                dateCreated: true,
                dateUpdated: true,
                dateDeleted: true,
                status: true,
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
