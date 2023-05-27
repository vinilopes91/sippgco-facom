import { type NextPage } from "next";

import Base from "@/layout/Base";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { stepMapper } from "@/utils/mapper";
import {
  getVacancyTypes,
  getModalities,
} from "@/components/Tables/Documents/utils";
import { toast } from "react-hot-toast";
import clsx from "clsx";
import ProcessStatusBadge from "@/components/ProcessStatusBadge";
import { handleTRPCError } from "@/utils/errors";

const ProcessDetail: NextPage = () => {
  const router = useRouter();
  const ctx = api.useContext();

  const { data: processData, isLoading: isLoadingProcess } =
    api.process.get.useQuery({
      id: router.query.processId as string,
    });

  const { isLoading: isActivating, mutate: activateProcess } =
    api.process.activateProcess.useMutation({
      onSuccess: () => {
        void ctx.process.list.invalidate();
        void ctx.process.get.invalidate({
          id: router.query.processId as string,
        });
        toast.success("Processo ativado com sucesso!");
      },
      onError: (e) => {
        handleTRPCError(
          e,
          "Falha ao ativar processo! Tente novamente mais tarde"
        );
      },
    });

  const { isLoading: isFinishing, mutate: finishProcess } =
    api.process.finishProcess.useMutation({
      onSuccess: () => {
        void ctx.process.list.invalidate();
        void ctx.process.get.invalidate({
          id: router.query.processId as string,
        });
        toast.success("Processo finalizado com sucesso!");
        router.back();
      },
      onError: (e) => {
        handleTRPCError(
          e,
          "Falha ao finalizar processo! Tente novamente mais tarde."
        );
      },
    });

  if (!router.query.processId) {
    return <div>404</div>;
  }

  if (isLoadingProcess) {
    return <div>Carregando...</div>;
  }

  if (!processData) {
    return <div>404</div>;
  }

  return (
    <Base pageTitle={processData.name} backBtn>
      <div className="mt-6 rounded-lg bg-white p-6 drop-shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Dados gerais</h2>
          {processData.status === "DRAFT" && (
            <button
              className={clsx("btn-primary btn", isActivating && "loading")}
              type="button"
              disabled={isActivating}
              onClick={() =>
                activateProcess({
                  id: processData.id,
                })
              }
            >
              Ativar processo
            </button>
          )}
          {processData.status === "FINISHED" && (
            <button
              className={clsx("btn-primary btn", isFinishing && "loading")}
              type="button"
              disabled={isFinishing}
              onClick={() =>
                finishProcess({
                  id: processData.id,
                })
              }
            >
              Finalizar processo
            </button>
          )}
        </div>
        <div className="mt-2">
          <p className="font-medium">
            Nome: <span className="font-normal">{processData.name}</span>
          </p>
          <p className="font-medium">
            Status: <ProcessStatusBadge status={processData.status} />
          </p>
          <p className="font-medium">
            Data inicial de inscrição:{" "}
            <span className="font-normal">
              {new Date(processData.applicationStartDate).toLocaleDateString()}
            </span>
          </p>
          <p className="font-medium">
            Data final de inscrição:{" "}
            <span className="font-normal">
              {new Date(processData.applicationEndDate).toLocaleDateString()}
            </span>
          </p>
        </div>
        <h2 className="mt-3 text-2xl font-bold">Vagas</h2>
        <div className="mt-2">
          <p className="font-medium">
            Mestrado regular:{" "}
            <span className="font-normal">
              {processData.regularMasterVacancies}
            </span>
          </p>
          <p className="font-medium">
            Mestrado especial:{" "}
            <span className="font-normal">
              {processData.specialMasterVacancies}
            </span>
          </p>
          <p className="font-medium">
            Doutorado:{" "}
            <span className="font-normal">
              {processData.regularDoctorateVacancies}
            </span>
          </p>
        </div>
        <h2 className="mt-3 text-2xl font-bold">Linhas de pesquisa</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nome</th>
                <th className="w-10/12">Tutores</th>
              </tr>
            </thead>
            <tbody>
              {processData.ProcessResearchLine.length === 0 && (
                <tr>
                  <td className="text-center font-medium" colSpan={3}>
                    Nenhuma linha de pesquisa cadastrada
                  </td>
                </tr>
              )}
              {processData.ProcessResearchLine.map(({ researchLine }) => (
                <tr key={researchLine.id}>
                  <td>{researchLine.name}</td>
                  <td>
                    {researchLine.TutorResearchLine.map(
                      (tutor) => tutor.name
                    ).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 className="mt-3 text-2xl font-bold">Documentos</h2>
        <div className="mt-2 w-full overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Etapa</th>
                <th>Modalidade</th>
                <th>Tipo de vaga</th>
                <th>Obrigatoriedade</th>
                <th>Pontuação por quantidade</th>
                <th>Pontuação máxima</th>
              </tr>
            </thead>
            <tbody>
              {processData.ProcessDocument.length === 0 && (
                <tr>
                  <td className="text-center font-medium" colSpan={8}>
                    Nenhum documento cadastrado
                  </td>
                </tr>
              )}
              {processData.ProcessDocument.map(({ document }) => (
                <tr key={document.id}>
                  <td>{document.name}</td>
                  <td>{stepMapper[document.step]}</td>
                  <td>{getModalities(document)}</td>
                  <td>{getVacancyTypes(document)}</td>
                  <td>{document.required ? "Sim" : "Não"}</td>
                  <td>{document.score || "-"}</td>
                  <td>{document.maximumScore || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Base>
  );
};

export default ProcessDetail;
