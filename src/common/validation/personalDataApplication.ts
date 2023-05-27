import * as z from "zod";

export const createPersonalDataApplicationSchema = z.object({
  applicationId: z.string().cuid("Campo obrigatório"),
  phone: z.string().min(10, "Número inválido").max(11, "Máximo 12 caracteres"),
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
