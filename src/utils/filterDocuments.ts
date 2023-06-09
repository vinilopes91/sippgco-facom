import { type Modality, type Step, type VacancyType } from "@prisma/client";
import { type RouterOutputs } from "./api";

type Params = {
  documents: RouterOutputs["processDocuments"]["listProcessDocuments"];
  step: Step;
  modality?: Modality | null;
  vacancyType?: VacancyType | null;
};

export const filterProcessStepDocuments = ({
  documents,
  modality,
  vacancyType,
  step,
}: Params) => {
  if (!modality || !vacancyType) return [];
  let filteredDocuments = documents.filter(
    (processDocument) => processDocument.document.step === step
  );
  if (modality) {
    filteredDocuments = filteredDocuments.filter((processDocument) => {
      const documentModalities = processDocument.document.modality.split(",");
      return documentModalities.includes(modality);
    });
  }
  if (vacancyType) {
    filteredDocuments = filteredDocuments.filter((processDocument) => {
      const documentVacancyTypes =
        processDocument.document.vacancyType.split(",");
      return documentVacancyTypes.includes(vacancyType);
    });
  }

  return filteredDocuments;
};
