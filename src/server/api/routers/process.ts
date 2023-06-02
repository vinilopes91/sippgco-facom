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
import { ProcessStatus } from "@prisma/client";
import { endOfDay, isBefore, startOfDay } from "date-fns";

export const processRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          status: z
            .enum([
              ProcessStatus.ACTIVE,
              ProcessStatus.DRAFT,
              ProcessStatus.FINISHED,
            ])
            .optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const processList = await ctx.prisma.process.findMany({
        where: {
          active: true,
          status: input?.status,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return processList;
    }),
  get: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
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
          message: "Processo seletivo não esta ativo",
        });
      }

      if (!process.applicationsResultAnnounced) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "O resultado das inscrições não foram divulgado",
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
          applicationEndDate: endOfDay(new Date(applicationEndDate)),
          applicationStartDate: startOfDay(new Date(applicationStartDate)),
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
  announceProcessApplicationsResults: protectedProcedure
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
          message: "Processo não encontrado",
        });
      }

      if (process.applicationsResultAnnounced) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Resultado das inscrições já foi anunciado",
        });
      }

      if (process.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Processo não esta ativo",
        });
      }

      if (isBefore(new Date(), new Date(process.applicationEndDate))) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Período de inscrições não foi finalizado",
        });
      }

      const processApplications = await ctx.prisma.application.findMany({
        where: {
          processId: input.id,
        },
        include: {
          user: true,
        },
      });

      if (
        processApplications.some(
          ({ status, applicationFilled }) => !status && applicationFilled
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Há inscrições finalizadas e não analisadas",
        });
      }

      const updatedProcess = await ctx.prisma.process.update({
        where: {
          id: input.id,
        },
        data: {
          applicationsResultAnnounced: true,
        },
      });

      return updatedProcess;
    }),
});
