import { Step, Modality, VacancyType, ProcessStatus } from "@prisma/client";

export const stepMapper = {
  [Step.ACADEMIC_DATA]: "Dados acadêmicos",
  [Step.CURRICULUM]: "Currículo",
  [Step.PERSONAL_DATA]: "Dados pessoais",
  [Step.REGISTRATION_DATA]: "Dados inscrição ",
} as const;

export const modalityMapper = {
  [Modality.DOCTORATE]: "Doutorado",
  [Modality.REGULAR_MASTER]: "Mestrado regular",
  [Modality.SPECIAL_MASTER]: "Mestrado especial",
} as const;

export const vacancyTypeMapper = {
  [VacancyType.BROAD_COMPETITION]: "Ampla concorrência",
  [VacancyType.DEFICIENT_QUOTA]: "Pessoas com deficiência",
  [VacancyType.INDIGENOUS_QUOTA]: "Indígenas",
  [VacancyType.RACIAL_QUOTA]: "Pretos, pardos e indígenas",
} as const;

export const processStatusMapper = {
  [ProcessStatus.ACTIVE]: "Processo ativo",
  [ProcessStatus.DRAFT]: "Rascunho",
  [ProcessStatus.FINISHED]: "Processo finalizado",
} as const;
