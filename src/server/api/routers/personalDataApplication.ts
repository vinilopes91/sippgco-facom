import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  finalizePersonalDataApplicationSchema,
  updatePersonalDataApplicationSchema,
} from "@/common/validation/personalDataApplication";
import { validateApplicationPeriodRequest } from "@/server/utils/validateApplicationPeriodRequest";
import { validateStepRequiredDocuments } from "@/server/utils/validateStepRequiredDocuments";

export const personalDataApplicationRouter = createTRPCRouter({
  finalize: protectedProcedure
    .input(finalizePersonalDataApplicationSchema)
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

      const userPersonalDataDocuments = personalDataDocuments?.filter(
        (processDocument) => processDocument.document.required
      );

      validateStepRequiredDocuments({
        application,
        userDocuments: userPersonalDataDocuments,
      });

      return ctx.prisma.personalDataApplication.upsert({
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
    .input(updatePersonalDataApplicationSchema)
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

      return ctx.prisma.personalDataApplication.upsert({
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
