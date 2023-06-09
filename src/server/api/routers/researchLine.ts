import {
  createTRPCRouter,
  enforceUserIsAdmin,
  protectedProcedure,
} from "@/server/api/trpc";
import { createResearchLineSchema } from "@/common/validation/researchLine";
import { z } from "zod";

export const researchLineRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const researchLineList = await ctx.prisma.researchLine.findMany({
      where: {
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        TutorResearchLine: true,
      },
    });

    return researchLineList;
  }),
  get: protectedProcedure.input(z.object({
    id: z.string().cuid(),
  })).query(async ({ ctx, input }) => {
    const researchLine = await ctx.prisma.researchLine.findFirst({
      where: {
        active: true,
        id: input.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        TutorResearchLine: true,
      },
    });

    return researchLine;
  }),
  create: protectedProcedure
    .use(enforceUserIsAdmin)
    .input(createResearchLineSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, tutors } = input;

      const researchLineCreated = await ctx.prisma.researchLine.create({
        data: {
          name,
          TutorResearchLine: {
            createMany: {
              data: tutors.map((tutor) => ({
                name: tutor,
              })),
            },
          },
        },
      });

      return researchLineCreated;
    }),
});
