import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const applicationRouter = createTRPCRouter({
  listUserApplications: protectedProcedure
    .input(
      z
        .object({
          processId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      console.log("input", input);
      const applicationsList = await ctx.prisma.application.findMany({
        where: {
          userId: ctx.session.user.id,
          processId: input?.processId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          process: true,
        },
      });

      return applicationsList;
    }),
  getUserApplication: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findFirst({
        where: {
          userId: ctx.session.user.id,
          id: input.applicationId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          process: {
            include: {
              ProcessResearchLine: {
                include: {
                  researchLine: true,
                },
              },
            },
          },
          personalDataApplication: true,
          registrationDataApplication: true,
          academicDataApplication: true,
          UserDocumentApplication: true,
        },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Inscrição não encontrada",
        });
      }

      return application;
    }),
  create: protectedProcedure
    .input(
      z.object({
        processId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { processId } = input;

      const applicationExists = await ctx.prisma.application.findFirst({
        where: {
          userId: ctx.session.user.id,
          processId,
        },
      });

      if (applicationExists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe uma inscrição para este processo seletivo",
        });
      }

      const application = await ctx.prisma.application.create({
        data: {
          userId: ctx.session.user.id,
          processId,
        },
      });

      return application;
    }),
});
