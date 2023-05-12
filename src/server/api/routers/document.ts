import {
  createTRPCRouter,
  enforceUserIsAdmin,
  protectedProcedure,
} from "@/server/api/trpc";
import { createDocumentSchema } from "@/common/validation/document";
import { type Prisma } from "@prisma/client";

export const documentRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const documentList = await ctx.prisma.document.findMany({
      where: {
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return documentList;
  }),
  create: protectedProcedure
    .use(enforceUserIsAdmin)
    .input(createDocumentSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        description,
        maximumScore,
        modality,
        name,
        required,
        score,
        step,
        vacancyType,
      } = input;

      const newDocument: Prisma.DocumentCreateInput = {
        name,
        description,
        required,
        modality: modality.join(","),
        step,
        vacancyType: vacancyType.join(","),
      };

      if (score) {
        newDocument.score = score;
      }

      if (maximumScore) {
        newDocument.maximumScore = maximumScore;
      }

      const documentCreated = await ctx.prisma.document.create({
        data: newDocument,
      });

      return documentCreated;
    }),
});
