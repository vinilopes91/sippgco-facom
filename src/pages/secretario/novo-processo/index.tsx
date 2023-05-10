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

const NewProcess: NextPage = () => {
  const [researchLinesSelected, setResearchLinesSelected] = useState<string[]>(
    []
  );
  const [documentsSelected, setDocumentsSelected] = useState<string[]>([]);
  const [openResearchLineModal, setOpenResearchLineModal] = useState(false);

  const { data: researchLineList } = api.researchLine.list.useQuery();
  const { data: documentsList } = api.document.list.useQuery();

  const { register, handleSubmit, formState, getValues } =
    useForm<CreateProcessSchema>({
      resolver: zodResolver(createProcessSchema),
    });

  const { errors } = formState;

  console.log(getValues());

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
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      <label>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </th>
                    <th>Name</th>
                    <th>Tutores</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <label>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </td>
                    <td>Linha de pesquisa 1</td>
                    <th>
                      <button type="button" className="btn-primary btn-xs btn">
                        Visualizar tutores
                      </button>
                    </th>
                  </tr>
                </tbody>
              </table>
            </div>
            <button type="button" className="btn-primary btn mt-4">
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
        <button
          type="button"
          className="btn"
          onClick={() => setOpenResearchLineModal(true)}
        >
          abrir modal
        </button>
        <CreateResearchLineModal
          open={openResearchLineModal}
          onClose={() => setOpenResearchLineModal(false)}
        />
      </div>
    </Base>
  );
};

export default NewProcess;
