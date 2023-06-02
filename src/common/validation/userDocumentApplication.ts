import { AnalysisStatus, Step } from "@prisma/client";
import * as z from "zod";

export const createUserDocumentApplication = z.object({
  documentId: z.string().cuid(),
  applicationId: z.string().cuid(),
  step: z.enum(
    [
      Step.ACADEMIC_DATA,
      Step.CURRICULUM,
      Step.PERSONAL_DATA,
      Step.REGISTRATION_DATA,
    ],
    {
      errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_enum_value) {
          return { message: "Opção inválida" };
        }
        return { message: ctx.defaultError };
      },
    }
  ),
  key: z.string().min(1, "Campo obrigatório"),
  filename: z.string().min(1, "Campo obrigatório"),
  quantity: z.number().int().positive().optional(),
});

export type CreateUserDocumentApplication = z.infer<
  typeof createUserDocumentApplication
>;

export const updateUserDocumentApplication = createUserDocumentApplication
  .partial()
  .extend({
    id: z.string().cuid(),
  });

export type UpdateUserDocumentApplication = z.infer<
  typeof updateUserDocumentApplication
>;

export const analyseUserDocumentSchema = z.object({
  id: z.string().cuid(),
  status: z.enum([AnalysisStatus.APPROVED, AnalysisStatus.REJECTED], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return { message: "Opção inválida" };
      }
      return { message: ctx.defaultError };
    },
  }),
  reasonForRejection: z.string().optional(),
});

export type AnalyseUserDocumentSchema = z.infer<
  typeof analyseUserDocumentSchema
>;
