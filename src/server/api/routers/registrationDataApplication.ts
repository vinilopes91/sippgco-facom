import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createRegistrationDataApplicationSchema,
  updateRegistrationDataApplicationSchema,
} from "@/common/validation/registrationDataApplication";
import { TRPCError } from "@trpc/server";
import { validateApplicationRequest } from "@/server/utils/validateApplicationRequest";

export const registrationDataApplicationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createRegistrationDataApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findFirst({
        where: {
          id: input.applicationId,
        },
        include: {
          process: true,
          personalDataApplication: true,
        },
      });

      validateApplicationRequest(application);

      const register = await ctx.prisma.registrationDataApplication.findFirst({
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

      if (!application?.personalDataApplication) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Etapa de dados pessoais não completada",
        });
      }

      return ctx.prisma.registrationDataApplication.create({
        data: {
          userId: ctx.session.user.id,
          ...input,
        },
      });
    }),
  update: protectedProcedure
    .input(updateRegistrationDataApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const register = await ctx.prisma.registrationDataApplication.findFirst({
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

      return ctx.prisma.registrationDataApplication.update({
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
