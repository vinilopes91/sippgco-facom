import * as z from "zod";

export const createResearchLineSchema = z.object({
  name: z.string().min(1, "Campo obrigatório").max(30, "Máximo 30 caracteres"),
  tutors: z
    .array(z.string().min(1, "Nome de tutor obrigatório"), {
      required_error: "Campo obrigatório",
    })
    .nonempty("Adicione pelo menos um tutor"),
});

export type CreateResearchLineSchema = z.infer<typeof createResearchLineSchema>;
