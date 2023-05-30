import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createPersonalDataApplicationSchema,
  updatePersonalDataApplicationSchema,
} from "@/common/validation/personalDataApplication";
import { TRPCError } from "@trpc/server";
import { validateApplicationPeriodRequest } from "@/server/utils/validateApplicationPeriodRequest";
import { filterProcessStepDocuments } from "@/utils/filterDocuments";
import { validateStepRequiredDocuments } from "@/server/utils/validateStepRequiredDocuments";

export const personalDataApplicationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createPersonalDataApplicationSchema)
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
        },
      });

      validateApplicationPeriodRequest(application);

      const register = await ctx.prisma.personalDataApplication.findFirst({
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

      const personalDataDocuments = await ctx.prisma.processDocument.findMany({
        where: {
          processId: application?.processId,
          document: {
            step: "PERSONAL_DATA",
            active: true,
          },
        },
        include: {
          document: true,
        },
      });

      const userPersonalDataDocuments = filterProcessStepDocuments({
        documents: personalDataDocuments,
        step: "PERSONAL_DATA",
      });

      validateStepRequiredDocuments({
        application,
        userDocuments: userPersonalDataDocuments,
      });

      return ctx.prisma.personalDataApplication.create({
        data: {
          userId: ctx.session.user.id,
          ...input,
        },
      });
    }),
  update: protectedProcedure
    .input(updatePersonalDataApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const register = await ctx.prisma.personalDataApplication.findFirst({
        where: {
          id: input.id,
        },
        include: {
          application: {
            include: {
              process: true,
              personalDataApplication: true,
              UserDocumentApplication: true,
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

      const personalDataDocuments = await ctx.prisma.processDocument.findMany({
        where: {
          processId: register.application.processId,
          document: {
            step: "PERSONAL_DATA",
            active: true,
          },
        },
        include: {
          document: true,
        },
      });

      const userRegistrationDocuments = filterProcessStepDocuments({
        documents: personalDataDocuments,
        step: "PERSONAL_DATA",
      });

      validateStepRequiredDocuments({
        application: register.application,
        userDocuments: userRegistrationDocuments,
      });

      return ctx.prisma.personalDataApplication.update({
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
