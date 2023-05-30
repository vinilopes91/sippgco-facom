import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createRegistrationDataApplicationSchema,
  updateRegistrationDataApplicationSchema,
} from "@/common/validation/registrationDataApplication";
import { TRPCError } from "@trpc/server";
import { validateApplicationPeriodRequest } from "@/server/utils/validateApplicationPeriodRequest";
import { filterProcessStepDocuments } from "@/utils/filterDocuments";
import { validateStepRequiredDocuments } from "@/server/utils/validateStepRequiredDocuments";

export const registrationDataApplicationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createRegistrationDataApplicationSchema)
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
        },
      });

      validateApplicationPeriodRequest(application);

      const register = await ctx.prisma.registrationDataApplication.findFirst({
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

      const registrationDataDocuments =
        await ctx.prisma.processDocument.findMany({
          where: {
            processId: application?.processId,
            document: {
              step: "REGISTRATION_DATA",
              active: true,
            },
          },
          include: {
            document: true,
          },
        });

      const userRegistrationDocuments = filterProcessStepDocuments({
        documents: registrationDataDocuments,
        step: "REGISTRATION_DATA",
        modality: input.modality,
        vacancyType: input.vacancyType,
      });

      validateStepRequiredDocuments({
        application,
        userDocuments: userRegistrationDocuments,
      });

      return ctx.prisma.registrationDataApplication.create({
        data: {
          userId: ctx.session.user.id,
          ...input,
        },
      });
    }),
  update: protectedProcedure
    .input(updateRegistrationDataApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const register = await ctx.prisma.registrationDataApplication.findFirst({
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

      const registrationDataDocuments =
        await ctx.prisma.processDocument.findMany({
          where: {
            processId: register.application.processId,
            document: {
              step: "REGISTRATION_DATA",
              active: true,
            },
          },
          include: {
            document: true,
          },
        });

      const userRegistrationDocuments = filterProcessStepDocuments({
        documents: registrationDataDocuments,
        step: "REGISTRATION_DATA",
        modality:
          input.modality ||
          register.application.registrationDataApplication?.modality,
        vacancyType:
          input.vacancyType ||
          register.application.registrationDataApplication?.vacancyType,
      });

      validateStepRequiredDocuments({
        application: register.application,
        userDocuments: userRegistrationDocuments,
      });

      return ctx.prisma.registrationDataApplication.update({
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
