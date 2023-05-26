import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createPersonalDataApplicationSchema,
  updatePersonalDataApplicationSchema,
} from "@/common/validation/personalDataApplication";
import { TRPCError } from "@trpc/server";

export const personalDataApplicationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createPersonalDataApplicationSchema)
    .mutation(async ({ ctx, input }) => {
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

      return ctx.prisma.personalDataApplication.create({
        data: {
          phone: input.phone,
          userId: ctx.session.user.id,
          applicationId: input.applicationId,
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
      });

      if (!register) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Registro não encontrado",
        });
      }

      return ctx.prisma.personalDataApplication.update({
        where: {
          id: input.id,
        },
        data: {
          phone: input.phone,
          userId: ctx.session.user.id,
          applicationId: input.applicationId,
        },
      });
    }),
});
