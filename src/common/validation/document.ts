import { Step, Modality, VacancyType } from "@prisma/client";
import * as z from "zod";

export const createDocumentSchema = z.object({
  name: z.string().min(1, "Campo obrigatório"),
  step: z.enum([
    Step.ACADEMIC_DATA,
    Step.CURRICULUM,
    Step.PERSONAL_DATA,
    Step.REGISTRATION_DATA,
  ]),
  modality: z.array(
    z.enum([
      Modality.DOCTORATE,
      Modality.REGULAR_MASTER,
      Modality.SPECIAL_MASTER,
    ])
  ),
  vacancyType: z.array(
    z.enum([
      VacancyType.DEFICIENT_QUOTA,
      VacancyType.INDIGENOUS_QUOTA,
      VacancyType.RACIAL_QUOTA,
    ])
  ),
  score: z.number().nonnegative("Valor inválido").optional(),
  maximumScore: z.number().nonnegative("Valor inválido").optional(),
  required: z.boolean(),
  description: z.string(),
});

export type CreateDocumentSchema = z.infer<typeof createDocumentSchema>;
