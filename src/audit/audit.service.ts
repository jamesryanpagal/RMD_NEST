import { Injectable } from "@nestjs/common";
import { $Enums, Prisma } from "generated/prisma";
import { FileService } from "src/file/file.service";
import { PrismaService } from "src/services/prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(
    private prismaService: PrismaService,
    private fileService: FileService,
  ) {}

  private targetModule: Record<$Enums.MODULES, string> = {
    [$Enums.MODULES.PROJECT]: "projectAudit",
    [$Enums.MODULES.PHASE]: "phaseAudit",
    [$Enums.MODULES.BLOCK]: "blockAudit",
    [$Enums.MODULES.LOT]: "lotAudit",
    [$Enums.MODULES.CLIENT]: "clientAudit",
    [$Enums.MODULES.USER]: "userAudit",
    [$Enums.MODULES.CONTRACT]: "contractAudit",
    [$Enums.MODULES.PAYMENT]: "paymentAudit",
    [$Enums.MODULES.RESERVATION]: "reservationAudit",
    [$Enums.MODULES.AGENT]: "agentAudit",
    [$Enums.MODULES.AGENT_COMMISSION]: "agentCommissionAudit",
    [$Enums.MODULES.FILES]: "fileAudit",
    [$Enums.MODULES.CLIENT_REQUEST]: "clientRequestAudit",
    [$Enums.MODULES.RESERVATION_REQUEST]: "reservationRequestAudit",
    [$Enums.MODULES.CONTRACT_REQUEST]: "contractRequestAudit",
    [$Enums.MODULES.PAYMENT_REQUEST]: "paymentRequestAudit",
    [$Enums.MODULES.AGENT_COMMISSION_REQUEST]: "agentCommissionRequestAudit",
    [$Enums.MODULES.FILES_REQUEST]: "fileRequestAudit",
  };

  private targetModuleIncludesModel: Partial<Record<$Enums.MODULES, any>> = {
    [$Enums.MODULES.PROJECT]: {
      include: {
        project: {
          include: {
            phase: {
              include: {
                block: {
                  include: {
                    lot: true,
                  },
                },
              },
            },
          },
        },
      },
    },
    [$Enums.MODULES.PHASE]: {
      include: {
        phase: {
          include: {
            project: true,
            block: {
              include: {
                lot: true,
              },
            },
          },
        },
      },
    },
    [$Enums.MODULES.BLOCK]: {
      include: {
        block: {
          include: {
            lot: true,
            phase: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    },
    [$Enums.MODULES.LOT]: {
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
    [$Enums.MODULES.CLIENT]: {},
    [$Enums.MODULES.USER]: {},
    [$Enums.MODULES.CONTRACT]: {
      include: {
        contract: {
          include: {
            client: true,
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
            agent: true,
            commissionOfAgent: true,
          },
        },
      },
    },
    [$Enums.MODULES.PAYMENT]: {
      include: {
        payment: {
          include: {
            contract: {
              include: {
                client: true,
                agent: true,
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
            reservation: {
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
            agentCommission: true,
          },
        },
      },
    },
    [$Enums.MODULES.RESERVATION]: {
      include: {
        reservation: {
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
            client: true,
            payment: {
              include: {
                files: true,
              },
            },
          },
        },
      },
    },
    [$Enums.MODULES.AGENT]: {},
    [$Enums.MODULES.AGENT_COMMISSION]: {
      include: {
        agentCommission: {
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
            agent: true,
          },
        },
      },
    },
    [$Enums.MODULES.FILES]: {},
    [$Enums.MODULES.CLIENT_REQUEST]: {
      include: {
        clientRequest: true,
      },
    },
    [$Enums.MODULES.RESERVATION_REQUEST]: {
      include: {
        reservationRequest: {
          include: {
            payment: {
              include: {
                reservation: {
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
                    client: true,
                  },
                },
              },
            },
          },
        },
      },
    },
    [$Enums.MODULES.CONTRACT_REQUEST]: {
      include: {
        contractRequest: {
          include: {
            contract: {
              include: {
                client: true,
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
                agent: true,
                commissionOfAgent: true,
              },
            },
          },
        },
      },
    },
    [$Enums.MODULES.PAYMENT_REQUEST]: {
      include: {
        paymentRequest: {
          include: {
            payment: {
              include: {
                contract: {
                  include: {
                    client: true,
                    agent: true,
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
                reservation: {
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
                agentCommission: true,
              },
            },
          },
        },
      },
    },
    [$Enums.MODULES.AGENT_COMMISSION_REQUEST]: {},
    [$Enums.MODULES.FILES_REQUEST]: {
      include: {
        fileRequest: {
          include: {
            file: true,
          },
        },
      },
    },
  };

  private onFormatResponse(type: $Enums.MODULES, data: any[]) {
    switch (type) {
      case "RESERVATION":
        return (
          data as (typeof this.targetModuleIncludesModel)["RESERVATION"][]
        ).map(({ reservation, ...rest }) => {
          const { lot, client, payment } = reservation || {};
          const { block, sqm, title: lotTitle } = lot || {};
          const { phase, title: blockTitle } = block || {};
          const { project, title: phaseTitle } = phase || {};
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
          } = project || {};
          return {
            ...rest,
            lot: {
              sqm,
              title: lotTitle,
            },
            block: {
              title: blockTitle,
            },
            phase: {
              title: phaseTitle,
            },
            project: {
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
            client,
            payment,
          };
        });
      case "PROJECT":
        return (
          data as (typeof this.targetModuleIncludesModel)["PROJECT"][]
        ).map(({ project, ...rest }) => {
          const { phase } = project || {};
          return {
            ...rest,
            project,
            phase,
          };
        });
      case "PHASE":
        return (data as (typeof this.targetModuleIncludesModel)["PHASE"][]).map(
          ({ phase, ...rest }) => {
            const { project, block } = phase || {};
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
            } = project || {};
            return {
              ...rest,
              project: {
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
              block,
            };
          },
        );
      case "LOT":
        return (data as (typeof this.targetModuleIncludesModel)["LOT"][]).map(
          ({ lot, ...rest }) => {
            const { block, title: lotTitle, sqm } = lot || {};
            const { phase, title: blockTitle } = block || {};
            const { project, title: phaseTitle } = phase || {};
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
            } = project || {};
            return {
              ...rest,
              lot: {
                title: lotTitle,
                sqm,
              },
              block: {
                title: blockTitle,
              },
              phase: {
                title: phaseTitle,
              },
              project: {
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
            };
          },
        );
      case "CONTRACT":
        return (
          data as (typeof this.targetModuleIncludesModel)["CONTRACT"][]
        ).map(({ contract, ...rest }) => {
          const { client, lot, agent, commissionOfAgent } = contract || {};
          const { block, title: lotTitle, sqm } = lot || {};
          const { phase, title: blockTitle } = block || {};
          const { project, title: phaseTitle } = phase || {};
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
          } = project || {};
          return {
            ...rest,
            client,
            lot: {
              title: lotTitle,
              sqm,
            },
            block: {
              title: blockTitle,
            },
            phase: {
              title: phaseTitle,
            },
            project: {
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
            agent,
            commissionOfAgent,
          };
        });
      case "PAYMENT":
        return (
          data as (typeof this.targetModuleIncludesModel)["PAYMENT"][]
        ).map(({ payment, ...rest }) => {
          const { contract, agentCommission, reservation } = payment || {};
          const { lot: reservationLot } = reservation || {};
          const {
            block: reservationBlock,
            title: reservationLotTitle,
            sqm: reservationSqm,
          } = reservationLot || {};
          const { phase: reservationPhase, title: reservationBlockTitle } =
            reservationBlock || {};
          const { project: reservationProject, title: reservationPhaseTitle } =
            reservationPhase || {};
          const {
            projectName: reservationProjectName,
            description: reservationDescription,
            houseNumber: reservationHouseNumber,
            street: reservationStreet,
            barangay: reservationBarangay,
            subdivision: reservationSubdivision,
            city: reservationCity,
            province: reservationProvince,
            region: reservationRegion,
            zip: reservationZip,
          } = reservationProject || {};
          const {
            lot,
            sqmPrice,
            downPaymentType,
            downPaymentStatus,
            totalMonthlyDown,
            totalMonthly,
            downPayment,
            totalDownPayment,
            totalDownPaymentBalance,
            downPaymentTerms,
            terms,
            miscellaneous,
            miscellaneousTotal,
            agentCommissionTotal,
            balance,
            totalLotPrice,
            tcp,
            paymentType,
            totalCashPayment,
            recurringPaymentDay,
            nextPaymentDate,
            paymentStartedDate,
            paymentLastDate,
            penaltyAmount,
            penaltyCount,
            excessPayment,
            client,
            agent,
          } = contract || {};
          const { block, title: lotTitle, sqm } = lot || {};
          const { phase, title: blockTitle } = block || {};
          const { project, title: phaseTitle } = phase || {};
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
          } = project || {};
          return {
            ...rest,
            contract: {
              sqmPrice,
              downPaymentType,
              downPaymentStatus,
              totalMonthlyDown,
              totalMonthly,
              downPayment,
              totalDownPayment,
              totalDownPaymentBalance,
              downPaymentTerms,
              terms,
              miscellaneous,
              miscellaneousTotal,
              agentCommissionTotal,
              balance,
              totalLotPrice,
              tcp,
              paymentType,
              totalCashPayment,
              recurringPaymentDay,
              nextPaymentDate,
              paymentStartedDate,
              paymentLastDate,
              penaltyAmount,
              penaltyCount,
              excessPayment,
            },
            agent,
            client,
            project: {
              projectName: projectName || reservationProjectName,
              description: description || reservationDescription,
              houseNumber: houseNumber || reservationHouseNumber,
              street: street || reservationStreet,
              barangay: barangay || reservationBarangay,
              subdivision: subdivision || reservationSubdivision,
              city: city || reservationCity,
              province: province || reservationProvince,
              region: region || reservationRegion,
              zip: zip || reservationZip,
            },
            lot: {
              title: lotTitle || reservationLotTitle,
              sqm: sqm || reservationSqm,
            },
            block: {
              title: blockTitle || reservationBlockTitle,
            },
            phase: {
              title: phaseTitle || reservationPhaseTitle,
            },
            agentCommission,
            reservation,
          };
        });
      case "AGENT_COMMISSION":
        return (
          data as (typeof this.targetModuleIncludesModel)["AGENT_COMMISSION"][]
        ).map(({ agentCommission, ...rest }) => {
          const { contract, agent } = agentCommission || {};
          return {
            ...rest,
            contract,
            agent,
          };
        });
      case "CLIENT_REQUEST":
        return (
          data as (typeof this.targetModuleIncludesModel)["CLIENT_REQUEST"][]
        ).map(({ clientRequest, ...rest }) => {
          return {
            ...rest,
            clientRequest,
          };
        });
      case "RESERVATION_REQUEST":
        return (
          data as (typeof this.targetModuleIncludesModel)["RESERVATION_REQUEST"][]
        ).map(({ reservationRequest, ...rest }) => {
          const { payment, status, ...restReservationRequest } =
            reservationRequest || {};
          const { reservation, ...restPayment } = payment || {};
          const { client, lot } = reservation || {};
          const { block, title: lotTitle, sqm } = lot || {};
          const { phase, title: blockTitle } = block || {};
          const { project, title: phaseTitle } = phase || {};
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
          } = project || {};
          return {
            ...rest,
            status,
            lot: {
              title: lotTitle,
              sqm,
            },
            block: {
              title: blockTitle,
            },
            phase: {
              title: phaseTitle,
            },
            project: {
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
            reservationRequest: restReservationRequest,
            client,
            payment: restPayment,
          };
        });
      case "CONTRACT_REQUEST":
        return (
          data as (typeof this.targetModuleIncludesModel)["CONTRACT_REQUEST"][]
        ).map(({ contractRequest, ...rest }) => {
          const { contract, status } = contractRequest || {};
          const {
            lot,
            sqmPrice,
            downPaymentType,
            downPaymentStatus,
            totalMonthlyDown,
            totalMonthly,
            downPayment,
            totalDownPayment,
            totalDownPaymentBalance,
            downPaymentTerms,
            terms,
            miscellaneous,
            miscellaneousTotal,
            agentCommissionTotal,
            balance,
            totalLotPrice,
            tcp,
            paymentType,
            totalCashPayment,
            recurringPaymentDay,
            nextPaymentDate,
            paymentStartedDate,
            paymentLastDate,
            penaltyAmount,
            penaltyCount,
            excessPayment,
            client,
            agent,
          } = contract || {};
          const { block, title: lotTitle, sqm } = lot || {};
          const { phase, title: blockTitle } = block || {};
          const { project, title: phaseTitle } = phase || {};
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
          } = project || {};
          return {
            ...rest,
            status,
            lot: {
              title: lotTitle,
              sqm,
            },
            block: {
              title: blockTitle,
            },
            phase: {
              title: phaseTitle,
            },
            project: {
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
            client,
            agent,
            contractRequest: {
              sqmPrice,
              downPaymentType,
              downPaymentStatus,
              totalMonthlyDown,
              totalMonthly,
              downPayment,
              totalDownPayment,
              totalDownPaymentBalance,
              downPaymentTerms,
              terms,
              miscellaneous,
              miscellaneousTotal,
              agentCommissionTotal,
              balance,
              totalLotPrice,
              tcp,
              paymentType,
              totalCashPayment,
              recurringPaymentDay,
              nextPaymentDate,
              paymentStartedDate,
              paymentLastDate,
              penaltyAmount,
              penaltyCount,
              excessPayment,
            },
          };
        });
      case "PAYMENT_REQUEST":
        return (
          data as (typeof this.targetModuleIncludesModel)["PAYMENT_REQUEST"][]
        ).map(({ paymentRequest, ...rest }) => {
          const { payment, status } = paymentRequest || {};
          const { contract, agentCommission, reservation } = payment || {};
          const { lot: reservationLot } = reservation || {};
          const {
            block: reservationBlock,
            title: reservationLotTitle,
            sqm: reservationSqm,
          } = reservationLot || {};
          const { phase: reservationPhase, title: reservationBlockTitle } =
            reservationBlock || {};
          const { project: reservationProject, title: reservationPhaseTitle } =
            reservationPhase || {};
          const {
            projectName: reservationProjectName,
            description: reservationDescription,
            houseNumber: reservationHouseNumber,
            street: reservationStreet,
            barangay: reservationBarangay,
            subdivision: reservationSubdivision,
            city: reservationCity,
            province: reservationProvince,
            region: reservationRegion,
            zip: reservationZip,
          } = reservationProject || {};
          const {
            lot,
            sqmPrice,
            downPaymentType,
            downPaymentStatus,
            totalMonthlyDown,
            totalMonthly,
            downPayment,
            totalDownPayment,
            totalDownPaymentBalance,
            downPaymentTerms,
            terms,
            miscellaneous,
            miscellaneousTotal,
            agentCommissionTotal,
            balance,
            totalLotPrice,
            tcp,
            paymentType,
            totalCashPayment,
            recurringPaymentDay,
            nextPaymentDate,
            paymentStartedDate,
            paymentLastDate,
            penaltyAmount,
            penaltyCount,
            excessPayment,
            client,
            agent,
          } = contract || {};
          const { block, title: lotTitle, sqm } = lot || {};
          const { phase, title: blockTitle } = block || {};
          const { project, title: phaseTitle } = phase || {};
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
          } = project || {};
          return {
            ...rest,
            status,
            contract: {
              sqmPrice,
              downPaymentType,
              downPaymentStatus,
              totalMonthlyDown,
              totalMonthly,
              downPayment,
              totalDownPayment,
              totalDownPaymentBalance,
              downPaymentTerms,
              terms,
              miscellaneous,
              miscellaneousTotal,
              agentCommissionTotal,
              balance,
              totalLotPrice,
              tcp,
              paymentType,
              totalCashPayment,
              recurringPaymentDay,
              nextPaymentDate,
              paymentStartedDate,
              paymentLastDate,
              penaltyAmount,
              penaltyCount,
              excessPayment,
            },
            agent,
            client,
            project: {
              projectName: projectName || reservationProjectName,
              description: description || reservationDescription,
              houseNumber: houseNumber || reservationHouseNumber,
              street: street || reservationStreet,
              barangay: barangay || reservationBarangay,
              subdivision: subdivision || reservationSubdivision,
              city: city || reservationCity,
              province: province || reservationProvince,
              region: region || reservationRegion,
              zip: zip || reservationZip,
            },
            lot: {
              title: lotTitle || reservationLotTitle,
              sqm: sqm || reservationSqm,
            },
            block: {
              title: blockTitle || reservationBlockTitle,
            },
            phase: {
              title: phaseTitle || reservationPhaseTitle,
            },
            agentCommission,
            reservation,
          };
        });
      case "FILES":
        const formattedFilesResponse =
          this.fileService.onFormatPaymentFilesResponse(
            data as Prisma.FileGetPayload<{}>[],
          );
        return formattedFilesResponse;
      case "FILES_REQUEST":
        const formattedFilesRequestResponse =
          this.fileService.onFormatPaymentFilesResponse(
            (
              data as (typeof this.targetModuleIncludesModel)["PAYMENT_REQUEST"][]
            ).map(({ fileRequest, ...rest }) => {
              const { file, status } = fileRequest || {};
              return {
                ...rest,
                status,
                fileRequest:
                  this.fileService.onFormatPaymentFilesResponse([file])?.[0] ||
                  {},
              };
            }),
          );
        return formattedFilesRequestResponse;
      default:
        return data;
    }
  }

  async audit(module: $Enums.MODULES) {
    try {
      const auditModuleResponse = await this.prismaService[
        this.targetModule[module]
      ].findMany({
        where: {
          status: { not: "DELETED" },
        },
        orderBy: {
          dateCreated: "desc",
        },
        ...(this.targetModuleIncludesModel?.[module] || {}),
      });

      const formattedResponse = await Promise.all(
        this.onFormatResponse(module, auditModuleResponse).map(
          async ({ createdBy, ...rest }) => {
            const userCreated = await this.prismaService.user.findUnique({
              where: {
                id: createdBy,
              },
            });

            const { password, ...restUserCreated } = userCreated || {};

            return {
              ...rest,
              createdBy: restUserCreated || null,
            };
          },
        ),
      );

      return formattedResponse;
    } catch (error) {
      throw error;
    }
  }
}
