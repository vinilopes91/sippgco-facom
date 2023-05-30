import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createAcademicDataApplicationSchema,
  updateAcademicDataApplicationSchema,
} from "@/common/validation/academicDataApplication";
import { TRPCError } from "@trpc/server";
import { validateApplicationPeriodRequest } from "@/server/utils/validateApplicationPeriodRequest";
import { filterProcessStepDocuments } from "@/utils/filterDocuments";
import { validateStepRequiredDocuments } from "@/server/utils/validateStepRequiredDocuments";

export const academicDataApplicationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createAcademicDataApplicationSchema)
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
          personalDataApplication: true,
          registrationDataApplication: true,
        },
      });

      validateApplicationPeriodRequest(application);

      const register = await ctx.prisma.academicDataApplication.findFirst({
        where: {
          userId: ctx.session.user.id,
          applicationId: input.applicationId,
        },
      });

      if (register) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe um registro com esses dados",
        });
      }

      if (!application?.personalDataApplication) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Etapa de dados pessoais não completada",
        });
      }

      if (!application?.registrationDataApplication) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Etapa de dados da inscrição não completada",
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

      return ctx.prisma.academicDataApplication.create({
        data: {
          userId: ctx.session.user.id,
          ...input,
        },
      });
    }),
  update: protectedProcedure
    .input(updateAcademicDataApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const register = await ctx.prisma.academicDataApplication.findFirst({
        where: {
          id: input.id,
        },
        include: {
          application: {
            include: {
              process: true,
              UserDocumentApplication: true,
              registrationDataApplication: true,
            },
          },
        },
      });

      if (!register) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Registro não encontrado",
        });
      }

      validateApplicationPeriodRequest(register.application);

      const academicDataDocuments = await ctx.prisma.processDocument.findMany({
        where: {
          processId: register.application.processId,
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
        modality: register.application.registrationDataApplication?.modality,
        vacancyType:
          register.application.registrationDataApplication?.vacancyType,
      });

      validateStepRequiredDocuments({
        application: register.application,
        userDocuments: userAcademicDocuments,
      });

      return ctx.prisma.academicDataApplication.update({
        where: {
          id: input.id,
        },
        data: {
          userId: ctx.session.user.id,
          ...input,
        },
      });
    }),
});
