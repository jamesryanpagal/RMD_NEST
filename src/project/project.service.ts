import { Injectable } from "@nestjs/common";
import { Prisma, PrismaClient } from "generated/prisma";
import { PrismaService } from "src/services/prisma/prisma.service";
import {
  BlockDto,
  CreateProjectDto,
  LotDto,
  PhaseDto,
  UpdateBlockDto,
  UpdateLotDto,
  UpdatePhaseDto,
} from "./dto";
import { MtzService } from "src/services/mtz/mtz.service";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { DefaultArgs } from "generated/prisma/runtime/library";

@Injectable()
export class ProjectService {
  constructor(
    private prismaService: PrismaService,
    private mtzService: MtzService,
    private exceptionService: ExceptionService,
  ) {}

  async createProject(dto: CreateProjectDto) {
    const {
      projectName,
      description,
      houseNumber,
      street,
      barangay,
      subdivision,
      city,
      province,
      region,
      zip,
      phase,
    } = dto;
    try {
      await this.prismaService.$transaction(async prisma => {
        const project = await prisma.project.create({
          data: {
            projectName,
            description,
            houseNumber,
            street,
            barangay,
            subdivision,
            city,
            province,
            region,
            zip,
          },
        });

        const { id } = project;

        await Promise.all(
          phase.map(async p => {
            const { title: phaseTitle, block } = p || {};
            const phaseResponse = await prisma.phase.create({
              data: {
                title: phaseTitle,
                project: {
                  connect: {
                    id,
                  },
                },
              },
            });

            await Promise.all(
              block.map(async b => {
                const { title: blockTitle, lot } = b || {};
                const blockResponse = await prisma.block.create({
                  data: {
                    title: blockTitle,
                    phase: {
                      connect: {
                        id: phaseResponse.id,
                      },
                    },
                  },
                });

                await Promise.all(
                  Array.from({ length: lot }, async (_, i) => {
                    const lotTitle = i + 1;
                    await prisma.lot.create({
                      data: {
                        title: lotTitle.toString(),
                        block: {
                          connect: {
                            id: blockResponse.id,
                          },
                        },
                      },
                    });
                  }),
                );
              }),
            );
          }),
        );
      });

      return "Project created successfully";
    } catch (error) {
      throw error;
    }
  }

  async updateProject(dto: Prisma.ProjectUpdateInput, id: string) {
    const {
      projectName,
      description,
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
      await this.prismaService.project.update({
        where: {
          id,
        },
        data: {
          projectName,
          description,
          houseNumber,
          street,
          barangay,
          subdivision,
          city,
          province,
          region,
          zip,
        },
      });

      return "Project updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async deleteProject(id: string) {
    try {
      await this.prismaService.project.update({
        where: {
          id,
        },
        data: {
          status: "DELETED",
        },
      });

      return "Project deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  async getProjects() {
    try {
      return await this.prismaService.project.findMany({
        where: {
          status: { not: "DELETED" },
        },
        orderBy: {
          order: "asc",
        },
        omit: {
          dateCreated: true,
          dateUpdated: true,
          dateDeleted: true,
          status: true,
        },
        include: {
          phase: {
            orderBy: {
              order: "asc",
            },
            where: {
              status: { not: "DELETED" },
            },
            omit: {
              order: true,
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
              status: true,
            },
            include: {
              block: {
                orderBy: {
                  order: "asc",
                },
                where: {
                  status: { not: "DELETED" },
                },
                omit: {
                  order: true,
                  dateCreated: true,
                  dateUpdated: true,
                  dateDeleted: true,
                  status: true,
                },
                include: {
                  lot: {
                    orderBy: {
                      order: "asc",
                    },
                    where: {
                      status: { not: "DELETED" },
                    },
                    omit: {
                      order: true,
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
      });
    } catch (error) {
      throw error;
    }
  }

  async getProject(id: string) {
    try {
      const project = await this.prismaService.project.findFirst({
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
          status: true,
        },
        include: {
          phase: {
            orderBy: {
              title: "asc",
            },
            where: {
              status: { not: "DELETED" },
            },
            omit: {
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
              status: true,
            },
            include: {
              block: {
                orderBy: {
                  title: "asc",
                },
                where: {
                  status: { not: "DELETED" },
                },
                omit: {
                  dateCreated: true,
                  dateUpdated: true,
                  dateDeleted: true,
                  status: true,
                },
                include: {
                  lot: {
                    orderBy: {
                      title: "asc",
                    },
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
              },
            },
          },
        },
      });

      return project;
    } catch (error) {
      throw error;
    }
  }

  async addPhase(id: string, dto: PhaseDto) {
    const { title, block } = dto || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        const phaseResponse = await prisma.phase.create({
          data: {
            title,
            project: {
              connect: {
                id,
              },
            },
          },
        });

        await Promise.all(
          block.map(async b => {
            const { title: blockTitle, lot } = b || {};
            const blockResponse = await prisma.block.create({
              data: {
                title: blockTitle,
                phase: {
                  connect: {
                    id: phaseResponse.id,
                  },
                },
              },
            });

            await Promise.all(
              Array.from({ length: lot }, async (_, i) => {
                const lotTitle = i + 1;
                await prisma.lot.create({
                  data: {
                    title: lotTitle.toString(),
                    block: {
                      connect: {
                        id: blockResponse.id,
                      },
                    },
                  },
                });
              }),
            );
          }),
        );
      });

      return "Phase added successfully";
    } catch (error) {
      throw error;
    }
  }

  async addBlock(id: string, dto: BlockDto) {
    const { title, lot } = dto || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        const blockResponse = await prisma.block.create({
          data: {
            title,
            phase: {
              connect: {
                id,
              },
            },
          },
        });

        await Promise.all(
          Array.from({ length: lot }, async (_, i) => {
            const lotTitle = i + 1;
            await prisma.lot.create({
              data: {
                title: lotTitle.toString(),
                block: {
                  connect: {
                    id: blockResponse.id,
                  },
                },
              },
            });
          }),
        );
      });

      return "Block added successfully";
    } catch (error) {
      throw error;
    }
  }

  async addLot(id: string, dto: LotDto) {
    const { title, sqm } = dto || {};
    try {
      await this.prismaService.lot.create({
        data: {
          title: title.toString(),
          sqm,
          block: {
            connect: {
              id,
            },
          },
        },
      });

      return "Lot added successfully";
    } catch (error) {
      throw error;
    }
  }

  async deletePhase(id: string) {
    try {
      await this.prismaService.phase.update({
        where: {
          id,
        },
        data: {
          status: "DELETED",
        },
      });

      return "Phase deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  async deleteBlock(id: string) {
    try {
      await this.prismaService.block.update({
        where: {
          id,
        },
        data: {
          status: "DELETED",
        },
      });

      return "Block deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  async deleteLot(id: string) {
    try {
      await this.prismaService.lot.update({
        where: {
          id,
        },
        data: {
          status: "DELETED",
        },
      });

      return "Lot deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  async updatePhase(projectId: string, id: string, dto: UpdatePhaseDto) {
    const { title } = dto || {};
    try {
      await this.prismaService.$transaction(async prisma => {
        const phaseResponse = await prisma.phase.findFirst({
          where: {
            AND: [
              {
                projectId,
              },
              {
                id,
              },
            ],
          },
        });

        await prisma.phase.update({
          where: {
            id: phaseResponse?.id,
          },
          data: {
            title,
          },
        });
      });

      return "Phase updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async getPhase(id: string) {
    try {
      return this.prismaService.phase.findUnique({
        where: {
          id,
        },
        omit: {
          status: true,
          dateCreated: true,
          dateUpdated: true,
          dateDeleted: true,
        },
        include: {
          block: {
            where: {
              status: { not: "DELETED" },
            },
            omit: {
              status: true,
              dateCreated: true,
              dateUpdated: true,
              dateDeleted: true,
            },
            include: {
              lot: {
                where: {
                  status: { not: "DELETED" },
                },
                omit: {
                  status: true,
                  dateCreated: true,
                  dateUpdated: true,
                  dateDeleted: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateBlock(id: string, dto: UpdateBlockDto) {
    const { title } = dto || {};
    try {
      await this.prismaService.block.update({
        where: {
          id,
        },
        data: {
          title,
        },
      });

      return "Block updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async getBlock(id: string) {
    try {
      return await this.prismaService.block.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateLot(id: string, dto: UpdateLotDto) {
    const { title, sqm } = dto || {};
    try {
      await this.prismaService.lot.update({
        where: {
          id,
        },
        data: {
          title: title.toString(),
          sqm,
        },
      });

      return "Lot updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async getLot(id: string) {
    let response: any | null = null;
    try {
      await this.prismaService.$transaction(async prisma => {
        await this.checkLotAvailability(id, prisma);
        const lotResponse = await prisma.lot.findUnique({
          where: {
            id,
          },
          include: {
            reservation: true,
            contract: {
              include: {
                payment: true,
              },
            },
          },
        });
        response = lotResponse;
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async checkLotAvailability(
    id: string,
    prisma?: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      "$on" | "$connect" | "$disconnect" | "$use" | "$transaction" | "$extends"
    >,
  ) {
    try {
      const lotResponse = await (prisma || this.prismaService).lot.findUnique({
        where: { id },
        include: {
          reservation: {
            where: {
              status: { in: ["ACTIVE", "DONE"] },
            },
          },
          contract: {
            where: {
              status: { in: ["ON_GOING", "DONE"] },
            },
          },
        },
      });

      if (!lotResponse) {
        this.exceptionService.throw("Lot not found", "NOT_FOUND");
        return;
      }

      const { status: lotStatus, reservation } = lotResponse || {};

      const {
        id: reservationId,
        status: reservationStatus,
        validity,
      } = reservation?.[0] || {};

      const validityExpired = this.mtzService
        .mtz(validity)
        .isBefore(this.mtzService.mtz());

      if (validityExpired && reservationStatus === "ACTIVE") {
        await (prisma || this.prismaService).reservation.update({
          where: { id: reservationId },
          data: {
            status: "FORFEITED",
          },
        });

        await (prisma || this.prismaService).lot.update({
          where: { id },
          data: {
            status: "OPEN",
          },
        });
      }

      return lotStatus;
    } catch (error) {
      throw error;
    }
  }
}
