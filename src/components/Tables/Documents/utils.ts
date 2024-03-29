import { type CreateProcessSchema } from "@/common/validation/process";
import { type RouterOutputs } from "@/utils/api";
import { modalityMapper, vacancyTypeMapper } from "@/utils/mapper";
import { Modality, type Document, VacancyType } from "@prisma/client";
import { type Dispatch } from "react";
import { type UseFormSetValue } from "react-hook-form";

export function useDocumentsTable(
  documentsList: RouterOutputs["document"]["list"],
  setDocumentsSelected: Dispatch<string[]>,
  setValue: UseFormSetValue<CreateProcessSchema>,
  documentsSelected: string[]
) {
  const handleSelectAllDocumentsClick = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked && documentsList && documentsList.length > 0) {
      const allDocuments = documentsList.map((document) => document.id);
      setDocumentsSelected(allDocuments);
      setValue("documents", allDocuments as [string, ...string[]]);
      return;
    }
    setDocumentsSelected([]);
    setValue("documents", [] as unknown as [string, ...string[]]);
  };

  const handleClickDocumentsRow = (
    _event: React.MouseEvent<unknown>,
    id: string
  ) => {
    const selectedIndex = documentsSelected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(documentsSelected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(documentsSelected.slice(1));
    } else if (selectedIndex === documentsSelected.length - 1) {
      newSelected = newSelected.concat(documentsSelected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        documentsSelected.slice(0, selectedIndex),
        documentsSelected.slice(selectedIndex + 1)
      );
    }

    setValue("documents", newSelected as [string, ...string[]]);
    setDocumentsSelected(newSelected);
  };
  return { handleClickDocumentsRow, handleSelectAllDocumentsClick };
}

export const getModalities = (document: Document) => {
  const modalities = document.modality.split(",");

  if (modalities.length === Object.keys(Modality).length) return "Todas";

  return modalities
    .map((modality) => modalityMapper[modality as keyof typeof Modality])
    .join(", ");
};

export const getVacancyTypes = (document: Document) => {
  const vacancyTypes = document.vacancyType.split(",");

  if (vacancyTypes.length === Object.keys(VacancyType).length) return "Todas";

  return vacancyTypes
    .map(
      (vacancyType) =>
        vacancyTypeMapper[vacancyType as keyof typeof VacancyType]
    )
    .join(", ");
};
