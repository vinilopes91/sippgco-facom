import {
  createTRPCRouter,
  enforceUserIsAdmin,
  protectedProcedure,
} from "@/server/api/trpc";
import { createDocumentSchema } from "@/common/validation/document";

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

      const documentCreated = await ctx.prisma.document.create({
        data: {
          name,
          description,
          maximumScore,
          modality: modality.join(","),
          required,
          score,
          step,
          vacancyType: vacancyType.join(","),
        },
      });

      return documentCreated;
    }),
});
