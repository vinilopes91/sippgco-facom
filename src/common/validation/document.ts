import { Step, Modality, VacancyType } from "@prisma/client";
import * as z from "zod";

export const createDocumentSchema = z.object({
  name: z.string().min(1, "Campo obrigatório"),
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
  modality: z.array(
    z.enum([Modality.DOCTORATE, Modality.MASTER], {
      errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_enum_value) {
          return { message: "Opção inválida" };
        }
        return { message: ctx.defaultError };
      },
    })
  ),
  vacancyType: z.array(
    z.enum(
      [
        VacancyType.BROAD_COMPETITION,
        VacancyType.DEFICIENT_QUOTA,
        VacancyType.HUMANITARIAN_POLICES,
        VacancyType.RACIAL_QUOTA,
      ],
      {
        errorMap: (issue, ctx) => {
          if (issue.code === z.ZodIssueCode.invalid_enum_value) {
            return { message: "Opção inválida" };
          }
          return { message: ctx.defaultError };
        },
      }
    )
  ),
  score: z.number().nonnegative("Valor inválido").optional(),
  maximumScore: z.number().nonnegative("Valor inválido").optional(),
  required: z.boolean(),
  description: z.string(),
});

export type CreateDocumentSchema = z.infer<typeof createDocumentSchema>;
