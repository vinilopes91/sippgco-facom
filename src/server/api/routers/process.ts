import {
  createTRPCRouter,
  enforceUserIsAdmin,
  protectedProcedure,
} from "@/server/api/trpc";
import {
  createProcessSchema,
  updateProcessSchema,
} from "@/common/validation/process";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const processRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const processList = await ctx.prisma.process.findMany({
      where: {
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return processList;
  }),
  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const process = await ctx.prisma.process.findFirst({
        where: {
          id: input.id,
          active: true,
        },
        include: {
          ProcessDocument: {
            include: {
              document: true,
            },
          },
          ProcessResearchLine: {
            include: {
              researchLine: {
                include: {
                  TutorResearchLine: true,
                },
              },
            },
          },
        },
      });

      if (!process) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return process;
    }),
  delete: protectedProcedure
    .use(enforceUserIsAdmin)
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const process = await ctx.prisma.process.findFirst({
        where: {
          id: input.id,
          active: true,
        },
      });

      if (!process) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (!process.active) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Process already deleted",
        });
      }

      const deletedProcess = await ctx.prisma.process.update({
        where: {
          id: input.id,
        },
        data: {
          active: false,
        },
        select: {
          id: true,
          active: true,
        },
      });

      return deletedProcess;
    }),
  activateProcess: protectedProcedure
    .use(enforceUserIsAdmin)
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const process = await ctx.prisma.process.findFirst({
        where: {
          id: input.id,
          active: true,
        },
      });

      if (!process) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (process.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Process is not Draft",
        });
      }

      const activatedProcess = await ctx.prisma.process.update({
        where: {
          id: input.id,
        },
        data: {
          status: "ACTIVE",
        },
      });

      return activatedProcess;
    }),
  finishProcess: protectedProcedure
    .use(enforceUserIsAdmin)
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const process = await ctx.prisma.process.findFirst({
        where: {
          id: input.id,
          active: true,
        },
      });

      if (!process) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (process.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Process is not active",
        });
      }

      const finishedProcess = await ctx.prisma.process.update({
        where: {
          id: input.id,
        },
        data: {
          status: "FINISHED",
        },
      });

      return finishedProcess;
    }),
  create: protectedProcedure
    .use(enforceUserIsAdmin)
    .input(createProcessSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        name,
        applicationEndDate,
        applicationStartDate,
        documents,
        regularDoctorateVacancies,
        regularMasterVacancies,
        researchLines,
        specialMasterVacancies,
      } = input;

      const processCreated = await ctx.prisma.process.create({
        data: {
          name,
          status: "DRAFT",
          applicationEndDate,
          applicationStartDate,
          regularDoctorateVacancies,
          regularMasterVacancies,
          specialMasterVacancies,
          ProcessDocument: {
            createMany: {
              data: documents.map((document) => ({
                documentId: document,
              })),
            },
          },
          ProcessResearchLine: {
            createMany: {
              data: researchLines.map((researchLine) => ({
                researchLineId: researchLine,
              })),
            },
          },
        },
      });

      return processCreated;
    }),
  update: protectedProcedure
    .use(enforceUserIsAdmin)
    .input(updateProcessSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        name,
        applicationEndDate,
        applicationStartDate,
        documents,
        regularDoctorateVacancies,
        regularMasterVacancies,
        researchLines,
        specialMasterVacancies,
      } = input;

      const updatedProcess = await ctx.prisma.process.update({
        where: {
          id,
        },
        data: {
          name,
          applicationEndDate,
          applicationStartDate,
          regularDoctorateVacancies,
          regularMasterVacancies,
          specialMasterVacancies,
          ProcessDocument: {
            deleteMany: {
              processId: id,
            },
            createMany: {
              data: documents.map((document) => ({
                documentId: document,
              })),
            },
          },
          ProcessResearchLine: {
            deleteMany: {
              processId: id,
            },
            createMany: {
              data: researchLines.map((researchLine) => ({
                researchLineId: researchLine,
              })),
            },
          },
        },
      });

      return updatedProcess;
    }),
});
