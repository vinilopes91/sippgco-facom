import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { s3 } from "@/server/utils/s3";
import {
  createUserDocumentApplication,
  updateUserDocumentApplication,
} from "@/common/validation/userDocumentApplication";
import { randomUUID } from "crypto";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

const BUCKET_NAME = "zeca-pagodinho";
const UPLOADING_TIME_LIMIT = 30; // 30 seconds

export const userDocumentRouter = createTRPCRouter({
  createPresignedPdfUrl: protectedProcedure.mutation(({ ctx }) => {
    const userId = ctx.session.user.id;

    const key = `${userId}/${randomUUID()}.pdf`;

    const s3Params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: UPLOADING_TIME_LIMIT,
      ContentType: "application/pdf",
    };

    const uploadUrl = s3.getSignedUrl("putObject", s3Params);

    console.log(uploadUrl, key);

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
            key: input.key,
            userId: ctx.session.user.id,
            applicationId: input.applicationId,
            step: input.step,
            documentId: input.documentId,
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
            key: input.key,
            userId: ctx.session.user.id,
            applicationId: input.applicationId,
            step: input.step,
            documentId: input.documentId,
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

      const url = await s3.getSignedUrlPromise("getObject", {
        Bucket: BUCKET_NAME,
        Key: userDocumentApplication.key,
      });

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

      await s3
        .deleteObject({
          Bucket: BUCKET_NAME,
          Key: userDocumentApplication.key,
        })
        .promise();

      return true;
    }),
});
