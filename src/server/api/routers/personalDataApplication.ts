import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createPersonalDataApplicationSchema,
  updatePersonalDataApplicationSchema,
} from "@/common/validation/personalDataApplication";
import { TRPCError } from "@trpc/server";
import { validateApplicationRequest } from "@/server/utils/validateApplicationRequest";

export const personalDataApplicationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createPersonalDataApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findFirst({
        where: {
          id: input.applicationId,
        },
        include: {
          process: true,
        },
      });

      validateApplicationRequest(application);

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

      validateApplicationRequest(register.application);

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
