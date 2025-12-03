import { Injectable } from "@nestjs/common";
import { Moment } from "moment-timezone";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { MtzService } from "src/services/mtz/mtz.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { StartAgentCommissionDto } from "./dto";
import { QuerySearchDto } from "src/dto";
import { Prisma } from "generated/prisma";
import { UserFullDetailsProps } from "src/type";

@Injectable()
export class AgentCommissionService {
  constructor(
    private prismaService: PrismaService,
    private mtzService: MtzService,
    private exceptionService: ExceptionService,
  ) {}

  async agentCommissions(query: QuerySearchDto, agentId: string) {
    try {
      const { search } = query || {};
      const searchArr = search?.split(" ") || [];
      const whereQuery: Prisma.AgentCommissionWhereInput = {
        AND: [
          {
            status: { not: "DELETED" },
          },
          {
            agentId,
          },
        ],
        ...(search && {
          OR: [
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
            {
              contract: {
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
            },
          ],
        }),
      };
      const agentCommissionResponse =
        await this.prismaService.agentCommission.findMany({
          where: whereQuery,
          orderBy: {
            dateCreated: "desc",
          },
          omit: {
            dateCreated: true,
            dateDeleted: true,
            dateUpdated: true,
          },
          include: {
            contract: {
              include: {
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
              },
            },
            agent: {
              // include: {
              //   contract: {
              //     where: {
              //       AND: [
              //         {
              //           status: { not: "DELETED" },
              //         },
              //         {
              //           agentId,
              //         },
              //       ],
              //     },
              //     select: {
              //       id: true,
              //       agentCommission: true,
              //       agentCommissionTotal: true,
              //       paymentStartedDate: true,
              //       paymentLastDate: true,
              //       lot: {
              //         select: {
              //           id: true,
              //           title: true,
              //           sqm: true,
              //           block: {
              //             select: {
              //               id: true,
              //               title: true,
              //               phase: {
              //                 select: {
              //                   id: true,
              //                   title: true,
              //                   project: {
              //                     select: {
              //                       id: true,
              //                       projectName: true,
              //                     },
              //                   },
              //                 },
              //               },
              //             },
              //           },
              //         },
              //       },
              //     },
              //   },
              // },
              omit: {
                dateCreated: true,
                dateDeleted: true,
                dateUpdated: true,
              },
            },
          },
        });

      return agentCommissionResponse.map(
        ({
          releaseEndDate,
          releaseStartDate,
          nextReleaseDate,
          agent,
          contract,
          ...rest
        }) => {
          const { firstName, lastName } = agent || {};
          const onFormatDate = (
            originalFormat: keyof typeof this.mtzService.dateFormat,
            date: string | null,
          ) => {
            return !date
              ? null
              : this.mtzService
                  .mtz(date, originalFormat)
                  .format(this.mtzService.dateFormat.dateAbbrev);
          };
          return {
            ...rest,
            firstName,
            lastName,
            releaseEndDate: onFormatDate("dateTimeUTCZ", releaseEndDate),
            releaseStartDate: onFormatDate("dateTimeUTCZ", releaseStartDate),
            nextReleaseDate: onFormatDate("dateTimeUTCZ", nextReleaseDate),
            contract,
          };
        },
      );
    } catch (error) {
      throw error;
    }
  }

  async agentCommission(id: string) {
    try {
      const agentCommissionResponse =
        await this.prismaService.agentCommission.findFirst({
          where: {
            AND: [{ id }, { status: { not: "DELETED" } }],
          },
          omit: {
            dateCreated: true,
            dateDeleted: true,
            dateUpdated: true,
          },
          include: {
            agent: {
              omit: {
                dateCreated: true,
                dateDeleted: true,
                dateUpdated: true,
              },
            },
          },
        });

      if (!agentCommissionResponse) {
        this.exceptionService.throw("Agent commission not found", "NOT_FOUND");
        return;
      }

      const {
        contractId,
        agent,
        releaseEndDate,
        releaseStartDate,
        nextReleaseDate,
        ...rest
      } = agentCommissionResponse;
      const { firstName, lastName } = agent || {};

      const contract = await this.prismaService.contract.findFirst({
        where: {
          id: contractId,
          // status: { not: "DELETED" },
        },
        select: {
          id: true,
          agentCommission: true,
          agentCommissionTotal: true,
          paymentStartedDate: true,
          paymentLastDate: true,
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
        },
      });

      const onFormatDate = (
        originalFormat: keyof typeof this.mtzService.dateFormat,
        date?: string | null,
      ) => {
        return !date
          ? null
          : this.mtzService
              .mtz(date, originalFormat)
              .format(this.mtzService.dateFormat.dateAbbrev);
      };

      return {
        ...rest,
        contractId,
        firstName,
        lastName,
        releaseEndDate: onFormatDate("dateTimeUTCZ", releaseEndDate),
        releaseStartDate: onFormatDate("dateTimeUTCZ", releaseStartDate),
        nextReleaseDate: onFormatDate("dateTimeUTCZ", nextReleaseDate),
        contract: contract || {},
      };
    } catch (error) {
      throw error;
    }
  }

  async startAgentCommission(
    id: string,
    dto: StartAgentCommissionDto,
    user?: UserFullDetailsProps,
  ) {
    const { terms, releaseStartDate } = dto;
    try {
      await this.prismaService.$transaction(async prisma => {
        const agentCommissionResponse = await prisma.agentCommission.findFirst({
          where: {
            AND: [
              {
                id,
              },
              {
                status: { notIn: ["DELETED", "CONTRACT_FORFEITED"] },
              },
            ],
          },
          include: {
            agent: true,
            contract: true,
          },
        });

        if (!agentCommissionResponse) {
          this.exceptionService.throw(
            "Agent commission not found, it is either deleted or contract has been forfeited.",
            "NOT_FOUND",
          );
          return;
        }

        const { contract } = agentCommissionResponse || {};
        const { agentCommissionTotal } = contract || {};
        let releaseEndDate: Moment | null = null;

        const parsedReleaseStartDate = this.mtzService.mtz(
          releaseStartDate,
          "defaultformat",
        );

        const parsedReleaseRecurringDate = parsedReleaseStartDate
          .clone()
          .toDate()
          .getDate();

        const nextReleaseDate = parsedReleaseStartDate
          .clone()
          .set("date", parsedReleaseRecurringDate)
          .format(this.mtzService.dateFormat.dateTimeUTCZ);

        for (let index = 0; index < terms; index++) {
          if (!releaseEndDate) {
            releaseEndDate = parsedReleaseStartDate;
          } else {
            releaseEndDate = releaseEndDate
              .clone()
              .add(1, "month")
              .set("date", parsedReleaseRecurringDate);
          }
        }

        await prisma.agentCommission.update({
          where: {
            id,
          },
          data: {
            terms,
            releaseStartDate: parsedReleaseStartDate.format(
              this.mtzService.dateFormat.dateTimeUTCZ,
            ),
            releaseEndDate: releaseEndDate?.format(
              this.mtzService.dateFormat.dateTimeUTCZ,
            ),
            nextReleaseDate,
            recurringReleaseDate: parsedReleaseRecurringDate,
            monthlyReleaseAmount: Number(
              ((agentCommissionTotal || 0) / terms).toFixed(2),
            ),
            status: "ON_GOING",
            updatedBy: user?.id,
          },
        });
      });

      return "Agent commission started successfully";
    } catch (error) {
      throw error;
    }
  }

  async deleteAgentCommission(id: string, user?: UserFullDetailsProps) {
    try {
      await this.prismaService.agentCommission.update({
        where: {
          id,
        },
        data: {
          status: "DELETED",
          deletedBy: user?.id,
        },
      });

      return "Agent commission deleted successfully";
    } catch (error) {
      throw error;
    }
  }
}
