import { Injectable } from "@nestjs/common";
import { Prisma } from "generated/prisma";
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

@Injectable()
export class ProjectService {
  constructor(private prismaService: PrismaService) {}

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
      console.log(error);
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
          projectName: "asc",
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
    console.log(id, dto);
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
      console.log(error);
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

  async updatePhase(id: string, dto: UpdatePhaseDto) {
    const { title } = dto || {};
    try {
      await this.prismaService.phase.update({
        where: {
          id,
        },
        data: {
          title,
        },
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
    try {
      return await this.prismaService.lot.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
