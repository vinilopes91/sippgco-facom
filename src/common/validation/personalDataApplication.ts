import * as z from "zod";
import { cpf as cpfValidator } from "cpf-cnpj-validator";

export const finalizePersonalDataApplicationSchema = z.object({
  applicationId: z.string().cuid("Campo obrigatório"),
  phone: z
    .string()
    .min(10, "Número de telefone inválido")
    .max(11, "Máximo 12 caracteres"),
  mobilePhone: z
    .string()
    .min(1, "Campo obrigatório")
    .length(11, "Número de celular inválido"),
  isWhatsApp: z.boolean(),
  cpf: z
    .string()
    .length(11, "CPF inválido")
    .refine((cpf) => cpfValidator.isValid(cpf), "CPF inválido"),
  rgNumber: z.string().length(8, "RG inválido"),
  rgState: z.string().length(2, "Estado inválido"),
  rgOrg: z.string().min(1, "Campo obrigatório"),
  birthDate: z.string().datetime("Data inválida"),
  street: z.string().min(1, "Campo obrigatório"),
  number: z.string().min(1, "Campo obrigatório"),
  complement: z.string().min(1, "Campo obrigatório").optional(),
  neighborhood: z.string().min(1, "Campo obrigatório"),
  city: z.string().min(1, "Campo obrigatório"),
  state: z.string().min(1, "Campo obrigatório"),
  cep: z.string().min(1, "Campo obrigatório"),
  nationality: z.string().min(1, "Campo obrigatório"),
});

export type FinalizePersonalDataApplicationSchema = z.infer<
  typeof finalizePersonalDataApplicationSchema
>;

export const updatePersonalDataApplicationSchema =
  finalizePersonalDataApplicationSchema.partial().extend({
    applicationId: z.string().cuid("Campo obrigatório"),
  });

export type UpdatePersonalDataApplicationSchema = z.infer<
  typeof updatePersonalDataApplicationSchema
>;
