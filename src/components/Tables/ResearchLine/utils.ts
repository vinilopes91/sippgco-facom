import { type CreateProcessSchema } from "@/common/validation/process";
import { type RouterOutputs } from "@/utils/api";
import { type Dispatch } from "react";
import { type UseFormSetValue } from "react-hook-form";

export function useResearchLineTable(
  researchLineList: RouterOutputs["researchLine"]["list"],
  setResearchLinesSelected: Dispatch<string[]>,
  setValue: UseFormSetValue<CreateProcessSchema>,
  researchLinesSelected: string[]
) {
  const handleSelectAllResearchLineClick = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (
      event.target.checked &&
      researchLineList &&
      researchLineList.length > 0
    ) {
      const allResearchLines = researchLineList.map(
        (researchLine) => researchLine.id
      );
      setResearchLinesSelected(allResearchLines);
      setValue("researchLines", allResearchLines as [string, ...string[]]);
      return;
    }
    setResearchLinesSelected([]);
    setValue("researchLines", [] as unknown as [string, ...string[]]);
  };

  const handleClickResearchLineRow = (
    _event: React.MouseEvent<unknown>,
    id: string
  ) => {
    const selectedIndex = researchLinesSelected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(researchLinesSelected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(researchLinesSelected.slice(1));
    } else if (selectedIndex === researchLinesSelected.length - 1) {
      newSelected = newSelected.concat(researchLinesSelected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        researchLinesSelected.slice(0, selectedIndex),
        researchLinesSelected.slice(selectedIndex + 1)
      );
    }

    setValue("researchLines", newSelected as [string, ...string[]]);
    setResearchLinesSelected(newSelected);
  };
  return { handleClickResearchLineRow, handleSelectAllResearchLineClick };
}
