import {
  createTRPCRouter,
  enforceUserIsAdmin,
  protectedProcedure,
} from "@/server/api/trpc";
import { s3 } from "@/server/utils/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  analyseUserDocumentSchema,
  createUserDocumentApplication,
  updateUserDocumentApplication,
} from "@/common/validation/userDocumentApplication";
import { randomUUID } from "crypto";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { isAfter } from "date-fns";

const BUCKET_NAME = "zeca-pagodinho";
const UPLOADING_TIME_LIMIT = 30; // 30 seconds

export const userDocumentRouter = createTRPCRouter({
  createPresignedPdfUrl: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const key = `${userId}/${randomUUID()}.pdf`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: "application/pdf",
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: UPLOADING_TIME_LIMIT,
    });

    return {
      uploadUrl,
      key,
    };
  }),
  create: protectedProcedure
    .input(createUserDocumentApplication)
    .mutation(async ({ input, ctx }) => {
      const userDocumentApplication =
        await ctx.prisma.userDocumentApplication.create({
          data: {
            userId: ctx.session.user.id,
            ...input,
          },
        });

      return userDocumentApplication;
    }),
  update: protectedProcedure
    .input(updateUserDocumentApplication)
    .mutation(async ({ input, ctx }) => {
      const userDocumentApplication =
        await ctx.prisma.userDocumentApplication.update({
          where: {
            id: input.id,
          },
          data: {
            userId: ctx.session.user.id,
            ...input,
          },
        });

      return userDocumentApplication;
    }),
  getUserDocumentPreSignedUrl: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        userId: z.string().cuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userDocumentApplication =
        await ctx.prisma.userDocumentApplication.findFirst({
          where: {
            id: input.id,
            userId: input.userId ?? ctx.session.user.id,
          },
        });

      if (!userDocumentApplication) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Documento não encontrado.",
        });
      }

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: userDocumentApplication.key,
        ResponseContentDisposition: `attachment; filename=${userDocumentApplication.filename}`,
      });

      const url = await getSignedUrl(s3, command);

      return url;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const userDocumentApplication =
        await ctx.prisma.userDocumentApplication.findFirst({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        });

      if (!userDocumentApplication) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Documento não encontrado.",
        });
      }

      await ctx.prisma.userDocumentApplication.delete({
        where: {
          id: input.id,
        },
      });

      await s3.deleteObject({
        Bucket: BUCKET_NAME,
        Key: userDocumentApplication.key,
      });

      return true;
    }),
  analyseUserDocument: protectedProcedure
    .use(enforceUserIsAdmin)
    .input(analyseUserDocumentSchema)
    .mutation(async ({ input, ctx }) => {
      const userDocumentApplication =
        await ctx.prisma.userDocumentApplication.findFirst({
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

      if (!userDocumentApplication) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Documento não encontrado.",
        });
      }

      if (
        isAfter(
          new Date(),
          new Date(
            userDocumentApplication.application.process.applicationEndDate
          )
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Período de inscrição encerrado",
        });
      }

      if (userDocumentApplication.application.status) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A inscrição já foi analisada",
        });
      }

      const updatedUserDocumentApplication =
        await ctx.prisma.userDocumentApplication.update({
          where: {
            id: input.id,
          },
          data: {
            status: input.status,
            reasonForRejection: input.reasonForRejection,
          },
        });

      return updatedUserDocumentApplication;
    }),
});
