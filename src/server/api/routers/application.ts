import {
  createTRPCRouter,
  enforceUserIsAdmin,
  protectedProcedure,
} from "@/server/api/trpc";
import { isValidPeriod } from "@/utils/application";
import { validateApplicationPeriodRequest } from "@/server/utils/validateApplicationPeriodRequest";
import { filterProcessStepDocuments } from "@/utils/filterDocuments";
import { AnalysisStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { isBefore } from "date-fns";
import { z } from "zod";

export const applicationRouter = createTRPCRouter({
  listUserApplications: protectedProcedure
    .input(
      z
        .object({
          processId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const applicationsList = await ctx.prisma.application.findMany({
        where: {
          userId: ctx.session.user.id,
          processId: input?.processId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          process: true,
        },
      });

      return applicationsList;
    }),
  getUserApplication: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findFirst({
        where: {
          userId: ctx.session.user.id,
          id: input.applicationId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          process: {
            include: {
              ProcessResearchLine: {
                include: {
                  researchLine: true,
                },
              },
            },
          },
          personalDataApplication: true,
          registrationDataApplication: true,
          academicDataApplication: true,
          UserDocumentApplication: true,
        },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Inscrição não encontrada",
        });
      }

      return application;
    }),
  create: protectedProcedure
    .input(
      z.object({
        processId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { processId } = input;

      const process = await ctx.prisma.process.findFirst({
        where: {
          id: processId,
        },
      });

      if (!process) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Processo seletivo não encontrado",
        });
      }

      const { applicationStartDate, applicationEndDate } = process;

      const isValidApplicationPeriod = isValidPeriod({
        applicationStartDate,
        applicationEndDate,
      });

      if (!isValidApplicationPeriod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Período de inscrição encerrado",
        });
      }

      if (process.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Processo seletivo não está ativo",
        });
      }

      const applicationExists = await ctx.prisma.application.findFirst({
        where: {
          userId: ctx.session.user.id,
          processId,
        },
      });

      if (applicationExists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe uma inscrição para este processo seletivo",
        });
      }

      const application = await ctx.prisma.application.create({
        data: {
          userId: ctx.session.user.id,
          processId,
        },
      });

      return application;
    }),
  finishApplicationFill: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findFirst({
        where: {
          id: input.applicationId,
        },
        include: {
          UserDocumentApplication: {
            include: {
              document: true,
            },
          },
          process: {
            include: {
              ProcessDocument: {
                include: {
                  document: true,
                },
              },
            },
          },
          academicDataApplication: true,
          personalDataApplication: true,
          registrationDataApplication: true,
        },
      });

      validateApplicationPeriodRequest(application);

      if (
        !application?.academicDataApplication ||
        !application?.personalDataApplication ||
        !application?.registrationDataApplication
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "É necessário o preenchimento das etapas anteriores",
        });
      }

      const curriculumDocuments = await ctx.prisma.processDocument.findMany({
        where: {
          processId: application?.processId,
          document: {
            step: "CURRICULUM",
            active: true,
          },
        },
        include: {
          document: true,
        },
      });

      const userAcademicDocuments = filterProcessStepDocuments({
        documents: curriculumDocuments,
        step: "CURRICULUM",
        modality: application.registrationDataApplication.modality,
        vacancyType: application.registrationDataApplication.vacancyType,
      });

      const requiredProcessStepDocuments = userAcademicDocuments.filter(
        (processDocument) => processDocument.document.required
      );

      const hasRequiredDocuments = requiredProcessStepDocuments.every(
        (requiredDocument) =>
          !!application?.UserDocumentApplication.find(
            (userUploadedDocument) =>
              userUploadedDocument.documentId === requiredDocument.documentId
          )
      );

      if (!hasRequiredDocuments) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Não foram enviados todos os documentos obrigatórios",
        });
      }

      const applicationUpdated = await ctx.prisma.application.update({
        where: {
          id: input.applicationId,
        },
        data: {
          applicationFilled: true,
        },
      });

      return applicationUpdated;
    }),
  getProcessApplications: protectedProcedure
    .input(
      z.object({
        processId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const process = await ctx.prisma.process.findFirst({
        where: {
          id: input.processId,
        },
      });

      if (!process) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Processo seletivo não encontrado",
        });
      }

      const applications = await ctx.prisma.application.findMany({
        where: {
          processId: input.processId,
          applicationFilled: true,
        },
        include: {
          user: true,
        },
      });

      return applications;
    }),
  get: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findFirst({
        where: {
          id: input.applicationId,
        },
        include: {
          UserDocumentApplication: {
            include: {
              document: true,
            },
          },
          personalDataApplication: true,
          registrationDataApplication: {
            include: {
              researchLine: true,
            },
          },
          academicDataApplication: true,
          user: true,
          process: true,
        },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Inscrição não encontrada",
        });
      }

      return application;
    }),
  review: protectedProcedure
    .use(enforceUserIsAdmin)
    .input(
      z.object({
        id: z.string(),
        status: z.enum([AnalysisStatus.APPROVED, AnalysisStatus.REJECTED], {
          errorMap: (issue, ctx) => {
            if (issue.code === z.ZodIssueCode.invalid_enum_value) {
              return { message: "Opção inválida" };
            }
            return { message: ctx.defaultError };
          },
        }),
        reasonForRejection: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findFirst({
        where: {
          id: input.id,
        },
        include: {
          UserDocumentApplication: {
            include: {
              document: true,
            },
          },
          process: true,
        },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Inscrição não encontrada",
        });
      }

      if (application.process.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Processo seletivo não está ativo",
        });
      }

      if (
        isBefore(new Date(), new Date(application.process.applicationEndDate))
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Período de inscrição ainda não encerrado",
        });
      }

      if (application.status) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Inscrição já analisada",
        });
      }

      if (
        !application.UserDocumentApplication.every(
          (userDocument) => !!userDocument.status
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Não foram analisados todos os documentos",
        });
      }

      const updatedApplication = await ctx.prisma.application.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
          reasonForRejection: input.reasonForRejection,
        },
      });

      return updatedApplication;
    }),
});
