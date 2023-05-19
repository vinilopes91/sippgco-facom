import * as z from "zod";

export const createPersonalDataApplication = z.object({
  name: z.string().min(1, "Campo obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z
    .string()
    .min(10, "Campo obrigatório")
    .max(11, "Máximo 11 caracteres"),
});

export type CreatePersonalDataApplication = z.infer<
  typeof createPersonalDataApplication
>;
