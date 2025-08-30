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
            reservation: true,
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
                reservation: true,
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
        fileRequest: true,
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
          const { payment } = reservationRequest || {};
          const { reservation } = payment || {};
          const { lot } = reservation || {};
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
            reservationRequest,
          };
        });
      case "CONTRACT_REQUEST":
        return (
          data as Prisma.ContractRequestAuditGetPayload<{
            include: {
              contractRequest: {
                include: {
                  contract: {
                    include: {
                      client: true;
                      lot: {
                        include: {
                          block: {
                            include: {
                              phase: {
                                include: {
                                  project: true;
                                };
                              };
                            };
                          };
                        };
                      };
                      agent: true;
                      commissionOfAgent: true;
                    };
                  };
                };
              };
            };
          }>[]
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
              status,
            },
          };
        });
      case "PAYMENT_REQUEST":
        return (
          data as Prisma.PaymentRequestAuditGetPayload<{
            include: {
              paymentRequest: {
                include: {
                  payment: {
                    include: {
                      contract: true;
                      reservation: true;
                      agentCommission: true;
                    };
                  };
                };
              };
            };
          }>[]
        ).map(({ paymentRequest, ...rest }) => {
          const { payment } = paymentRequest || {};
          const { contract, reservation, agentCommission } = payment || {};
          return {
            ...rest,
            contract,
            reservation,
            agentCommission,
            paymentRequest,
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
              data as (typeof this.targetModuleIncludesModel)["FILES_REQUEST"][]
            ).map(({ fileRequest, ...rest }) => {
              return {
                ...rest,
                fileRequest,
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

      return this.onFormatResponse(module, auditModuleResponse);
    } catch (error) {
      throw error;
    }
  }
}
