import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { validateApplicationPeriodRequest } from "@/server/utils/validateApplicationPeriodRequest";
import { filterProcessStepDocuments } from "@/utils/filterDocuments";
import { TRPCError } from "@trpc/server";
import { isAfter, isBefore } from "date-fns";
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

      const isValidPeriod =
        isBefore(new Date(), new Date(applicationEndDate)) &&
        isAfter(new Date(), new Date(applicationStartDate));

      if (!isValidPeriod) {
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
});
