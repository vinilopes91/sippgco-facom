import {
  Step,
  Modality,
  VacancyType,
  ProcessStatus,
  AnalysisStatus,
  ModalityType,
} from "@prisma/client";

export const stepMapper: { [Property in keyof typeof Step]: string } = {
  [Step.ACADEMIC_DATA]: "Dados acadêmicos",
  [Step.CURRICULUM]: "Currículo",
  [Step.PERSONAL_DATA]: "Dados pessoais",
  [Step.REGISTRATION_DATA]: "Dados inscrição ",
} as const;

export const modalityMapper: { [Property in keyof typeof Modality]: string } = {
  [Modality.DOCTORATE]: "Doutorado",
  [Modality.MASTER]: "Mestrado",
} as const;

export const vacancyTypeMapper: {
  [Property in keyof typeof VacancyType]: string;
} = {
  [VacancyType.BROAD_COMPETITION]: "Ampla concorrência",
  [VacancyType.DEFICIENT_QUOTA]: "Pessoas com deficiência",
  [VacancyType.HUMANITARIAN_POLICES]:
    "Pessoas sob políticas humanitárias no Brasil",
  [VacancyType.RACIAL_QUOTA]: "Pretos, pardos, indígenas",
} as const;

export const processStatusMapper: {
  [Property in keyof typeof ProcessStatus]: string;
} = {
  [ProcessStatus.ACTIVE]: "Processo ativo",
  [ProcessStatus.DRAFT]: "Rascunho",
  [ProcessStatus.FINISHED]: "Processo finalizado",
} as const;

export const analysisStatusMapper: {
  [Property in keyof typeof AnalysisStatus]: string;
} = {
  [AnalysisStatus.APPROVED]: "Deferida",
  [AnalysisStatus.REJECTED]: "Indeferida",
} as const;

export const documentAnalysisStatusMapper: {
  [Property in keyof typeof AnalysisStatus]: string;
} = {
  [AnalysisStatus.APPROVED]: "Documento aceito",
  [AnalysisStatus.REJECTED]: "Documento rejeitado",
} as const;

export const modalityTypeMapper: {
  [Property in keyof typeof ModalityType]: string;
} = {
  [ModalityType.REGULAR]: "Aluno regular",
  [ModalityType.SPECIAL]: "Aluno especial",
} as const;
