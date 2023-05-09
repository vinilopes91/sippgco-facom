import * as z from "zod";

export const createProcessSchema = z.object({
  name: z.string().min(1, "Campo obrigatório"),
  applicationStartDate: z.string().datetime("Data inválida"),
  applicationEndDate: z.string().datetime("Data inválida"),
  regularMasterVacancies: z.number().int().nonnegative("Valor inválido"),
  specialMasterVacancies: z.number().int().nonnegative("Valor inválido"),
  regularDoctorateVacancies: z.number().int().nonnegative("Valor inválido"),
  researchLines: z.array(z.string().cuid()),
  documents: z.array(z.string().cuid()),
});

export const updateProcessSchema = createProcessSchema.partial().extend({
  id: z.string().cuid(),
  documents: z.array(z.string().cuid()),
  researchLines: z.array(z.string().cuid()),
});

export type CreateProcessSchema = z.infer<typeof createProcessSchema>;
export type UpdateProcessSchema = z.infer<typeof updateProcessSchema>;
