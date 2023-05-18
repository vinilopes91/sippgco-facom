import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const applicationRouter = createTRPCRouter({
  listUserApplications: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        processId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const applicationsList = await ctx.prisma.application.findMany({
        where: {
          userId: input.userId,
          processId: input.processId,
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
  get: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        applicationId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findFirst({
        where: {
          userId: input.userId,
          id: input.applicationId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          process: true,
          PersonalDataApplication: true,
          RegistrationDataApplication: true,
          AcademicDataApplication: true,
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
        userId: z.string(),
        processId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, processId } = input;

      const applicationExists = await ctx.prisma.application.findFirst({
        where: {
          userId,
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
          userId,
          processId,
        },
      });

      return application;
    }),
});
