import { Modality, VacancyType } from "@prisma/client";
import * as z from "zod";

export const createRegistrationDataApplicationSchema = z.object({
  applicationId: z.string().cuid(),
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

export type CreateRegistrationDataApplicationSchema = z.infer<
  typeof createRegistrationDataApplicationSchema
>;

export const updateRegistrationDataApplicationSchema =
  createRegistrationDataApplicationSchema.partial().extend({
    id: z.string().cuid(),
  });

export type UpdateRegistrationDataApplicationSchema = z.infer<
  typeof updateRegistrationDataApplicationSchema
>;
