import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Step } from "@prisma/client";
import { z } from "zod";

export const processDocumentsRouter = createTRPCRouter({
  listProcessDocuments: protectedProcedure
    .input(
      z.object({
        processId: z.string(),
        step: z
          .enum([
            Step.ACADEMIC_DATA,
            Step.CURRICULUM,
            Step.PERSONAL_DATA,
            Step.REGISTRATION_DATA,
          ])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const processDocumentsList = await ctx.prisma.processDocument.findMany({
        where: {
          processId: input?.processId,
          document: {
            step: input?.step,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          document: true,
        },
      });

      return processDocumentsList;
    }),
});
