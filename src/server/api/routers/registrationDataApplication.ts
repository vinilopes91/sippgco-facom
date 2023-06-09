import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  finalizeRegistrationDataApplicationSchema,
  updateRegistrationDataApplicationSchema,
} from "@/common/validation/registrationDataApplication";
import { validateApplicationPeriodRequest } from "@/server/utils/validateApplicationPeriodRequest";
import { filterProcessStepDocuments } from "@/utils/filterDocuments";
import { validateStepRequiredDocuments } from "@/server/utils/validateStepRequiredDocuments";

export const registrationDataApplicationRouter = createTRPCRouter({
  finalize: protectedProcedure
    .input(finalizeRegistrationDataApplicationSchema)
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
        },
      });

      validateApplicationPeriodRequest(application);

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

      return ctx.prisma.registrationDataApplication.upsert({
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
    .input(updateRegistrationDataApplicationSchema)
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

      return ctx.prisma.registrationDataApplication.upsert({
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
