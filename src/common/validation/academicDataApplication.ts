import * as z from "zod";

export const finalizeAcademicDataApplicationSchema = z.object({
  applicationId: z.string().cuid(),
  course: z.string().min(1, "Campo obrigatório"),
  completionOrForecastYearCourse: z
    .string()
    .length(4, "Campo obrigatório, digite o ano completo")
    .transform((val, ctx) => {
      const parsed = parseInt(val);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Input inválido",
        });
        return z.NEVER;
      }
      if (parsed < 1900) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ano inválido",
        });
        return z.NEVER;
      }
      return val;
    }),
  institutionCourse: z.string().min(1, "Campo obrigatório"),
  area: z.string().min(1, "Campo obrigatório").optional(),
  completionOrForecastYearArea: z
    .string()
    .length(4, "Campo obrigatório, digite o ano completo")
    .transform((val, ctx) => {
      const parsed = parseInt(val);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Input inválido",
        });
        return z.NEVER;
      }
      if (parsed < 1900) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ano inválido",
        });
        return z.NEVER;
      }
      return val;
    })
    .optional(),
  institutionArea: z.string().min(1, "Campo obrigatório").optional(),
  wasSpecialStudent: z.boolean(),
});

export type FinalizeAcademicDataApplicationSchema = z.infer<
  typeof finalizeAcademicDataApplicationSchema
>;

export const updateAcademicDataApplicationSchema =
  finalizeAcademicDataApplicationSchema.partial().extend({
    applicationId: z.string().cuid("Campo obrigatório"),
  });

export type UpdateAcademicDataApplicationSchema = z.infer<
  typeof updateAcademicDataApplicationSchema
>;
