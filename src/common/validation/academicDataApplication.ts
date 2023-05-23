import * as z from "zod";

export const createAcademicDataApplication = z.object({
  courseArea: z.string().min(1, "Campo obrigatório"),
  completionOrForecastYear: z.string().length(4, "Campo obrigatório"),
  institution: z.string().min(1, "Campo obrigatório"),
  wasSpecialStudent: z.boolean(),
});

export type CreateAcademicDataApplication = z.infer<
  typeof createAcademicDataApplication
>;
