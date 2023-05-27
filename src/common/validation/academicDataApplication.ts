import * as z from "zod";

export const createAcademicDataApplicationSchema = z.object({
  applicationId: z.string().cuid(),
  courseArea: z.string().min(1, "Campo obrigatório"),
  completionOrForecastYear: z.string().length(4, "Campo obrigatório"),
  institution: z.string().min(1, "Campo obrigatório"),
  wasSpecialStudent: z.boolean(),
});

export type CreateAcademicDataApplicationSchema = z.infer<
  typeof createAcademicDataApplicationSchema
>;

export const updateAcademicDataApplicationSchema =
  createAcademicDataApplicationSchema.partial().extend({
    id: z.string().cuid(),
  });

export type UpdateAcademicDataApplicationSchema = z.infer<
  typeof updateAcademicDataApplicationSchema
>;
