import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import { StartAgentCommissionDto } from "./dto";
import { MtzService } from "src/services/mtz/mtz.service";

@Injectable()
export class AgentCommissionService {
  constructor(
    private prismaService: PrismaService,
    private mtzService: MtzService,
  ) {}

  async agentCommissions() {
    try {
      const agentCommissionResponse =
        await this.prismaService.agentCommission.findMany({
          where: {
            status: {
              not: "DELETED",
            },
          },
          omit: {
            dateCreated: true,
            dateDeleted: true,
            dateUpdated: true,
          },
          include: {
            agent: {
              include: {
                contract: {
                  select: {
                    id: true,
                    agentCommission: true,
                    agentCommissionTotal: true,
                    paymentStartedDate: true,
                    paymentLastDate: true,
                  },
                },
              },
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
          ...rest
        }) => {
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
            agentCommission: agent.contract?.agentCommission,
            agentCommissionTotal: agent.contract?.agentCommission,
            releaseEndDate: onFormatDate("dateTimeUTCZ", releaseEndDate),
            releaseStartDate: onFormatDate("dateTimeUTCZ", releaseStartDate),
            nextReleaseDate: onFormatDate("dateTimeUTCZ", nextReleaseDate),
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
            AND: [
              {
                id,
              },
              {
                status: {
                  not: "DELETED",
                },
              },
            ],
          },
          omit: {
            dateCreated: true,
            dateDeleted: true,
            dateUpdated: true,
          },
          include: {
            agent: {
              include: {
                contract: {
                  select: {
                    id: true,
                    agentCommission: true,
                    agentCommissionTotal: true,
                    paymentStartedDate: true,
                    paymentLastDate: true,
                  },
                },
              },
              omit: {
                dateCreated: true,
                dateDeleted: true,
                dateUpdated: true,
              },
            },
          },
        });

      const {
        releaseEndDate,
        releaseStartDate,
        nextReleaseDate,
        agent,
        ...rest
      } = agentCommissionResponse || {};

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
        agentCommission: agent?.contract?.agentCommission,
        agentCommissionTotal: agent?.contract?.agentCommission,
        releaseEndDate: onFormatDate("dateTimeUTCZ", releaseEndDate),
        releaseStartDate: onFormatDate("dateTimeUTCZ", releaseStartDate),
        nextReleaseDate: onFormatDate("dateTimeUTCZ", nextReleaseDate),
      };
    } catch (error) {
      throw error;
    }
  }

  async startAgentCommission(id: string, dto: StartAgentCommissionDto) {
    const { terms } = dto;
    try {
      await this.prismaService.$transaction(async prisma => {
        const agentCommissionResponse = await prisma.agentCommission.findFirst({
          where: {
            AND: [{ id }, { status: { not: "DELETED" } }],
          },
          include: {
            agent: {
              include: {
                contract: true,
              },
            },
          },
        });

        const { releaseStartDate, agent } = agentCommissionResponse || {};
        const { agentCommissionTotal } = agent?.contract || {};
        let releaseEndDate: string | null = null;

        const parsedReleaseStartDate = this.mtzService.mtz(
          releaseStartDate,
          "dateTimeUTCZ",
        );
        const parsedReleaseDate = parsedReleaseStartDate
          .clone()
          .toDate()
          .getDate();

        const nextReleaseDate = parsedReleaseStartDate
          .clone()
          .add(1, "month")
          .set("date", parsedReleaseDate)
          .format(this.mtzService.dateFormat.dateTimeUTCZ);

        for (let index = 0; index < terms; index++) {
          releaseEndDate = parsedReleaseStartDate
            .add(1, "month")
            .set("date", parsedReleaseDate)
            .format(this.mtzService.dateFormat.dateTimeUTCZ);
        }

        await prisma.agentCommission.update({
          where: {
            id,
          },
          data: {
            terms,
            releaseEndDate,
            nextReleaseDate,
            monthlyReleaseAmount: Number(
              ((agentCommissionTotal || 0) / terms).toFixed(2),
            ),
            status: "ON_GOING",
          },
        });
      });

      return "Agent commission started successfully";
    } catch (error) {
      throw error;
    }
  }

  async deleteAgentCommission(id: string) {
    try {
      await this.prismaService.agentCommission.update({
        where: {
          id,
        },
        data: {
          status: "DELETED",
        },
      });

      return "Agent commission deleted successfully";
    } catch (error) {
      throw error;
    }
  }
}
