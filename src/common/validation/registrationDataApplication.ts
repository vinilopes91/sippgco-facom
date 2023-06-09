import { Modality, VacancyType, ModalityType } from "@prisma/client";
import * as z from "zod";

export const finalizeRegistrationDataApplicationSchema = z.object({
  applicationId: z.string().cuid(),
  specialStudent: z.boolean(),
  scholarship: z.boolean(),
  modality: z.enum([Modality.DOCTORATE, Modality.MASTER], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return { message: "Opção inválida" };
      }
      return { message: ctx.defaultError };
    },
  }),
  modalityType: z.enum([ModalityType.REGULAR, ModalityType.SPECIAL], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return { message: "Opção inválida" };
      }
      return { message: ctx.defaultError };
    },
  }),
  vacancyType: z.enum(
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
  ),
  researchLineId: z.string().cuid(),
  tutors: z.string().min(1, "Campo obrigatório").optional(),
});

export type FinalizeRegistrationDataApplicationSchema = z.infer<
  typeof finalizeRegistrationDataApplicationSchema
>;

export const updateRegistrationDataApplicationSchema =
  finalizeRegistrationDataApplicationSchema.partial().extend({
    applicationId: z.string().cuid("Campo obrigatório"),
  });

export type UpdateRegistrationDataApplicationSchema = z.infer<
  typeof updateRegistrationDataApplicationSchema
>;
