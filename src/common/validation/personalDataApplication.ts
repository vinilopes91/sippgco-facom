import * as z from "zod";

export const createPersonalDataApplicationSchema = z.object({
  name: z.string().min(1, "Campo obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z
    .string()
    .min(10, "Campo obrigatório")
    .max(11, "Máximo 12 caracteres"),
  applicationId: z.string().cuid("Campo obrigatório"),
});

export type CreatePersonalDataApplicationSchema = z.infer<
  typeof createPersonalDataApplicationSchema
>;

export const updatePersonalDataApplicationSchema =
  createPersonalDataApplicationSchema.partial().extend({
    id: z.string().cuid(),
  });

export type UpdateUserDocumentApplicationSchema = z.infer<
  typeof updatePersonalDataApplicationSchema
>;
