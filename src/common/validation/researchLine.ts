import * as z from "zod";

export const createResearchLineSchema = z.object({
  name: z.string().min(1, "Campo obrigatório"),
  tutors: z
    .array(z.string().min(1, "Nome de tutor obrigatório"))
    .nonempty("Campo obrigatório"),
});

export type CreateResearchLineSchema = z.infer<typeof createResearchLineSchema>;
