import { type NextPage } from "next";
import { useState } from "react";

import Base from "@/layout/Base";
import Input from "@/components/Input";
import { useForm } from "react-hook-form";
import {
  createProcessSchema,
  type CreateProcessSchema,
} from "@/common/validation/process";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/utils/api";
import CreateResearchLineModal from "@/components/Modals/CreateResearchLine";
import ResearchLineTable from "@/components/Tables/ResearchLine";

const NewProcess: NextPage = () => {
  const [researchLinesSelected, setResearchLinesSelected] = useState<string[]>(
    []
  );
  // const [documentsSelected, setDocumentsSelected] = useState<string[]>([]);
  const [openResearchLineModal, setOpenResearchLineModal] = useState(false);

  const { data: researchLineList } = api.researchLine.list.useQuery();
  const { data: documentsList } = api.document.list.useQuery();

  const { register, handleSubmit, formState, setValue, getValues } =
    useForm<CreateProcessSchema>({
      resolver: zodResolver(createProcessSchema),
      defaultValues: {
        name: "",
        applicationStartDate: "",
        applicationEndDate: "",
        regularDoctorateVacancies: 0,
        regularMasterVacancies: 0,
        specialMasterVacancies: 0,
        researchLines: [],
        documents: [],
      },
    });

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

  const { errors } = formState;

  const submitForm = handleSubmit(() => {
    console.log("submit");
  });

  return (
    <Base pageTitle="Novo processo" backBtn>
      <div className="mt-6 rounded-lg bg-white p-6">
        <form onSubmit={submitForm} className="flex flex-col gap-4">
          <div className="w-full">
            <h2 className="text-2xl font-bold">Dados gerais</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input
                label="Nome"
                name="name"
                register={register}
                error={errors.name}
              />
              <Input
                type="date"
                label="Data inicial de inscrição"
                name="applicationStartDate"
                register={register}
                registerOptions={{
                  setValueAs: (value: string) =>
                    value && new Date(value).toISOString(),
                }}
                error={errors.applicationStartDate}
              />
              <Input
                type="date"
                label="Data final de inscrição"
                name="applicationEndDate"
                register={register}
                registerOptions={{
                  setValueAs: (value: string) =>
                    value && new Date(value).toISOString(),
                }}
                error={errors.applicationEndDate}
              />
            </div>
          </div>

          <div className="w-full">
            <h2 className="text-2xl font-bold">Vagas</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input
                label="Mestrado regular"
                name="regularMasterVacancies"
                type="number"
                positiveIntegerInput
                register={register}
                registerOptions={{
                  valueAsNumber: true,
                }}
                error={errors.regularMasterVacancies}
              />
              <Input
                label="Mestrato especial"
                name="specialMasterVacancies"
                type="number"
                positiveIntegerInput
                register={register}
                registerOptions={{
                  valueAsNumber: true,
                }}
                error={errors.specialMasterVacancies}
              />
              <Input
                label="Doutorado"
                name="regularDoctorateVacancies"
                type="number"
                positiveIntegerInput
                register={register}
                registerOptions={{
                  valueAsNumber: true,
                }}
                error={errors.regularDoctorateVacancies}
              />
            </div>
          </div>

          <div className="w-full">
            <h2 className="text-2xl font-bold">Linhas de pesquisa</h2>
            <div className="mt-4 w-full overflow-x-auto">
              <ResearchLineTable
                data={researchLineList || []}
                handleClickResearchLineRow={handleClickResearchLineRow}
                handleSelectAllResearchLineClick={
                  handleSelectAllResearchLineClick
                }
                researchLinesSelected={researchLinesSelected}
              />
            </div>
            <button
              type="button"
              className="btn-primary btn mt-4"
              onClick={() => setOpenResearchLineModal(true)}
            >
              Adicionar linha de pesquisa
            </button>
          </div>

          <div className="w-full">
            <h2 className="text-2xl font-bold">Documentos</h2>
            <div></div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary btn">
              Criar processo
            </button>
          </div>
        </form>
      </div>

      <CreateResearchLineModal
        open={openResearchLineModal}
        onClose={() => setOpenResearchLineModal(false)}
      />
    </Base>
  );
};

export default NewProcess;
