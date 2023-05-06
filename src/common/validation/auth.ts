import * as z from "zod";

export const signInSchema = z.object({
  username: z.string().min(6, "Mínimo 6 caracteres"),
  password: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .max(12, "Máximo 12 caracteres"),
});

export const signUpSchema = signInSchema
  .extend({
    name: z.string().min(1, "Campo obrigatório"),
    email: z.string().email("E-mail inválido"),
    confirmPassword: z
      .string()
      .min(6, "Mínimo 6 caracteres")
      .max(12, "Máximo 12 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas diferentes",
    path: ["confirmPassword"],
  });

export type LoginSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
