import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createAcademicDataApplicationSchema,
  updateAcademicDataApplicationSchema,
} from "@/common/validation/academicDataApplication";
import { TRPCError } from "@trpc/server";
import { validateApplicationRequest } from "@/server/utils/validateApplicationRequest";

export const academicDataApplicationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createAcademicDataApplicationSchema)
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

      const register = await ctx.prisma.academicDataApplication.findFirst({
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

      return ctx.prisma.academicDataApplication.create({
        data: {
          userId: ctx.session.user.id,
          ...input,
        },
      });
    }),
  update: protectedProcedure
    .input(updateAcademicDataApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const register = await ctx.prisma.academicDataApplication.findFirst({
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

      return ctx.prisma.academicDataApplication.update({
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
