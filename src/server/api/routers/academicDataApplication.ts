import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  finalizeAcademicDataApplicationSchema,
  updateAcademicDataApplicationSchema,
} from "@/common/validation/academicDataApplication";
import { TRPCError } from "@trpc/server";
import { validateApplicationPeriodRequest } from "@/server/utils/validateApplicationPeriodRequest";
import { filterProcessStepDocuments } from "@/utils/filterDocuments";
import { validateStepRequiredDocuments } from "@/server/utils/validateStepRequiredDocuments";

export const academicDataApplicationRouter = createTRPCRouter({
  finalize: protectedProcedure
    .input(finalizeAcademicDataApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findFirst({
        where: {
          id: input.applicationId,
          active: true,
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
          personalDataApplication: true,
          registrationDataApplication: true,
        },
      });

      validateApplicationPeriodRequest(application);

      if (!application?.registrationDataApplication) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "É necessário finalizar a etapa de dados da inscrição",
        });
      }
      
      if (!application?.registrationDataApplication.modality || !application?.registrationDataApplication.vacancyType) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "É necessário finalizar a etapa de dados da inscrição",
        });
      }

      const academicDataDocuments = await ctx.prisma.processDocument.findMany({
        where: {
          processId: application?.processId,
          document: {
            step: "ACADEMIC_DATA",
            active: true,
          },
        },
        include: {
          document: true,
        },
      });

      const userAcademicDocuments = filterProcessStepDocuments({
        documents: academicDataDocuments,
        step: "ACADEMIC_DATA",
        modality: application.registrationDataApplication.modality,
        vacancyType: application.registrationDataApplication.vacancyType,
      });

      validateStepRequiredDocuments({
        application,
        userDocuments: userAcademicDocuments,
      });

      return ctx.prisma.academicDataApplication.upsert({
        where: {
          applicationId: input.applicationId,
        },
        update: {
          stepCompleted: true,
          ...input,
        },
        create: {
          userId: ctx.session.user.id,
          stepCompleted: true,
          ...input,
        },
      });
    }),
  update: protectedProcedure
    .input(updateAcademicDataApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findFirst({
        where: {
          id: input.applicationId,
          active: true,
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
        },
      });

      validateApplicationPeriodRequest(application);

      return ctx.prisma.academicDataApplication.upsert({
        where: {
          applicationId: input.applicationId,
        },
        create: {
          userId: ctx.session.user.id,
          ...input,
        },
        update: {
          userId: ctx.session.user.id,
          ...input,
        },
      });
    }),
});
