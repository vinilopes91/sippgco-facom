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
import { api, type RouterOutputs } from "@/utils/api";
import CreateResearchLineModal from "@/components/Modals/CreateResearchLine";
import ResearchLineTable from "@/components/Tables/ResearchLine";
import { useResearchLineTable } from "@/components/Tables/ResearchLine/utils";
import DocumentsTable from "@/components/Tables/Documents";
import { useDocumentsTable } from "@/components/Tables/Documents/utils";
import CreateProcessDocumentModal from "@/components/Modals/CreateProcessDocument";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import clsx from "clsx";
import { handleTRPCError } from "@/utils/errors";

const NewProcess: NextPage = () => {
  const [researchLinesSelected, setResearchLinesSelected] = useState<string[]>(
    []
  );
  const [documentsSelected, setDocumentsSelected] = useState<string[]>([]);
  const [openResearchLineModal, setOpenResearchLineModal] = useState(false);
  const [openDocumentModal, setOpenDocumentModal] = useState(false);

  const { data: researchLineList } = api.researchLine.list.useQuery();
  const { data: documentsList } = api.document.list.useQuery();
  const ctx = api.useContext();
  const router = useRouter();

  const { register, handleSubmit, formState, setValue, reset } =
    useForm<CreateProcessSchema>({
      resolver: zodResolver(createProcessSchema),
      defaultValues: {
        name: "",
        applicationStartDate: "",
        applicationEndDate: "",
        researchLines: [],
        documents: [],
      },
    });

  const { mutate, isLoading } = api.process.create.useMutation({
    onSuccess: () => {
      void ctx.document.list.invalidate();
      toast.success("Processo criado com sucesso!");
      reset();
      router.back();
    },
    onError: (e) => {
      handleTRPCError(
        e,
        "Falha ao criar documento! Tente novamente mais tarde."
      );
    },
  });

  const { handleClickResearchLineRow, handleSelectAllResearchLineClick } =
    useResearchLineTable(
      researchLineList as RouterOutputs["researchLine"]["list"],
      setResearchLinesSelected,
      setValue,
      researchLinesSelected
    );

  const { handleClickDocumentsRow, handleSelectAllDocumentsClick } =
    useDocumentsTable(
      documentsList as RouterOutputs["document"]["list"],
      setDocumentsSelected,
      setValue,
      documentsSelected
    );

  const { errors } = formState;

  const onSubmit = (data: CreateProcessSchema) => {
    return mutate(data);
  };

  return (
    <Base pageTitle="Novo processo" backBtn>
      <div className="mt-6 rounded-lg bg-white p-6 drop-shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                errorMessage={errors.researchLines?.message}
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
            <div className="mt-4 w-full overflow-x-auto">
              <DocumentsTable
                data={documentsList || []}
                handleClickDocumentRow={handleClickDocumentsRow}
                handleSelectAllDocumentsClick={handleSelectAllDocumentsClick}
                documentsSelected={documentsSelected}
                errorMessage={errors.documents?.message}
              />
            </div>
            <button
              type="button"
              className="btn-primary btn mt-4"
              onClick={() => setOpenDocumentModal(true)}
            >
              Adicionar documento
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={clsx("btn-primary btn", isLoading && "loading")}
            >
              Criar processo
            </button>
          </div>
        </form>
      </div>

      <CreateResearchLineModal
        open={openResearchLineModal}
        onClose={() => setOpenResearchLineModal(false)}
      />
      <CreateProcessDocumentModal
        open={openDocumentModal}
        onClose={() => setOpenDocumentModal(false)}
      />
    </Base>
  );
};

export default NewProcess;
