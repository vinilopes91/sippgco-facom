import { Modality, VacancyType } from "@prisma/client";
import * as z from "zod";

export const createRegistrationDataApplication = z.object({
  specialStudent: z.boolean(),
  scholarship: z.boolean(),
  modality: z.enum([
    Modality.DOCTORATE,
    Modality.REGULAR_MASTER,
    Modality.SPECIAL_MASTER,
  ]),
  vacancyType: z.enum([
    VacancyType.DEFICIENT_QUOTA,
    VacancyType.INDIGENOUS_QUOTA,
    VacancyType.RACIAL_QUOTA,
  ]),
  researchLine: z.string().cuid(),
});

export type CreateRegistrationDataApplication = z.infer<
  typeof createRegistrationDataApplication
>;
