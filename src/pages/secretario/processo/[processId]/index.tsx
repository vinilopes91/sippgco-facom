import { type NextPage } from "next";

import Base from "@/layout/Base";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { analysisStatusMapper, stepMapper } from "@/utils/mapper";
import {
  getVacancyTypes,
  getModalities,
} from "@/components/Tables/Documents/utils";
import { toast } from "react-hot-toast";
import clsx from "clsx";
import ProcessStatusBadge from "@/components/ProcessStatusBadge";
import { handleTRPCError } from "@/utils/errors";
import { isAfter } from "date-fns";

const ProcessDetail: NextPage = () => {
  const router = useRouter();
  const ctx = api.useContext();

  const processId = router.query.processId as string;

  const { data: processData, isLoading: isLoadingProcess } =
    api.process.get.useQuery(
      {
        id: processId,
      },
      {
        enabled: !!processId,
      }
    );

  const { data: processApplications, isLoading: isLoadingApplications } =
    api.application.getProcessApplications.useQuery(
      {
        processId: processId,
      },
      {
        enabled: !!processId,
      }
    );

  const { isLoading: isActivating, mutate: activateProcess } =
    api.process.activateProcess.useMutation({
      onSuccess: () => {
        void ctx.process.list.invalidate();
        void ctx.process.get.invalidate({
          id: processId,
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
          id: processId,
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

  const {
    mutate: finishProcessApplications,
    isLoading: isFinishingProcessApplications,
  } = api.process.announceProcessApplicationsResults.useMutation({
    onSuccess: () => {
      void ctx.process.list.invalidate();
      void ctx.process.get.invalidate({
        id: processId,
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

  const enableAnnounceButton =
    processData.status === "ACTIVE" &&
    !processData.applicationsResultAnnounced &&
    processApplications?.every(
      ({ status, applicationFilled }) => status && applicationFilled
    ) &&
    isAfter(new Date(), new Date(processData.applicationEndDate));

  return (
    <Base pageTitle="Gerenciar processo" backBtn>
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
          {processData.status === "ACTIVE" &&
            processData.applicationsResultAnnounced && (
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
          {processData.editalLink && (
            <p className="font-medium">
              Link edital:{" "}
              <a
                href={processData.editalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Edital {processData.name}
              </a>
            </p>
          )}
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
          <p className="font-medium">
            Data final para análise:{" "}
            <span className="font-normal">
              {new Date(processData.analysisEndDate).toLocaleDateString()}
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

        <h2 className="mt-3 text-2xl font-bold">Inscrições</h2>
        <div className="mt-2 w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nome do candidato</th>
                <th>Status</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {processApplications?.length === 0 && (
                <tr>
                  <td className="text-center font-medium" colSpan={3}>
                    Nenhuma inscrição cadastrada
                  </td>
                </tr>
              )}
              {isLoadingApplications && (
                <>
                  <tr>
                    <td
                      className="h-14 animate-pulse bg-slate-300 text-center font-medium"
                      colSpan={3}
                    />
                  </tr>
                  <tr>
                    <td
                      className="h-14 animate-pulse bg-slate-300 text-center font-medium"
                      colSpan={3}
                    />
                  </tr>
                  <tr>
                    <td
                      className="h-14 animate-pulse bg-slate-300 text-center font-medium"
                      colSpan={3}
                    />
                  </tr>
                </>
              )}
              {processApplications?.map(({ id, user, status }) => (
                <tr key={id}>
                  <td
                    onClick={() =>
                      router.push(
                        `/secretario/processo/${processId}/inscricao/${id}`
                      )
                    }
                    className="w-fit cursor-pointer hover:underline"
                  >
                    {user.name}
                  </td>
                  <td>{status ? "Analisado" : "Pendente"}</td>
                  <td>
                    {status ? (
                      `Inscrição ${analysisStatusMapper[status]}`
                    ) : (
                      <button
                        className="btn-primary btn-sm btn"
                        onClick={() =>
                          router.push(
                            `/secretario/processo/${processId}/inscricao/${id}`
                          )
                        }
                      >
                        Analisar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {enableAnnounceButton && (
          <button
            className={clsx(
              "btn-primary btn mt-6",
              isFinishingProcessApplications && "loading"
            )}
            onClick={() =>
              finishProcessApplications({
                id: processData.id,
              })
            }
          >
            Divulgar resultado das inscrições
          </button>
        )}

        <h2 className="mt-3 text-2xl font-bold">Linhas de pesquisa</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nome</th>
                <th className="w-10/12">Docentes</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingProcess && (
                <>
                  <tr>
                    <td
                      className="h-14 animate-pulse bg-slate-300 text-center font-medium"
                      colSpan={3}
                    />
                  </tr>
                  <tr>
                    <td
                      className="h-14 animate-pulse bg-slate-300 text-center font-medium"
                      colSpan={3}
                    />
                  </tr>
                  <tr>
                    <td
                      className="h-14 animate-pulse bg-slate-300 text-center font-medium"
                      colSpan={3}
                    />
                  </tr>
                </>
              )}
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
          <table className="table-zebra table w-full">
            <thead>
              <tr>
                <th className="relative">Nome</th>
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
              {isLoadingProcess && (
                <>
                  <tr>
                    <td
                      className="h-14 animate-pulse bg-slate-300 text-center font-medium"
                      colSpan={8}
                    />
                  </tr>
                  <tr>
                    <td
                      className="h-14 animate-pulse bg-slate-300 text-center font-medium"
                      colSpan={8}
                    />
                  </tr>
                  <tr>
                    <td
                      className="h-14 animate-pulse bg-slate-300 text-center font-medium"
                      colSpan={8}
                    />
                  </tr>
                </>
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
