import { type NextPage } from "next";
import Base from "@/layout/Base";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import ProcessStatusBadge from "@/components/ProcessStatusBadge";
import clsx from "clsx";
import { toast } from "react-hot-toast";
import { isBefore } from "date-fns";
import { handleTRPCError } from "@/utils/errors";

const Processo: NextPage = () => {
  const router = useRouter();
  const ctx = api.useContext();

  const { data: processData, isLoading: isLoadingProcess } =
    api.process.get.useQuery(
      {
        id: router.query.processId as string,
      },
      {
        enabled: !!router.query.processId,
      }
    );

  const { data: userApplications } =
    api.application.listUserApplications.useQuery(
      {
        processId: router.query.processId as string,
      },
      {
        enabled: !!router.query.processId,
      }
    );

  const { isLoading: isLoadingCreateApplication, mutate: applyProcess } =
    api.application.create.useMutation({
      onSuccess: (applicationCreated) => {
        void ctx.document.list.invalidate();
        toast.success("Inscrição feita com sucesso!");
        void router.push(`/candidato/inscricao/${applicationCreated.id}`);
      },
      onError: (e) => {
        handleTRPCError(
          e,
          "Falha ao fazer inscrição! Tente novamente mais tarde."
        );
      },
    });

  if (!router.query.processId) {
    return <div>404</div>;
  }

  if (isLoadingProcess) {
    return <div>Loading...</div>;
  }

  if (!processData) {
    return <div>404</div>;
  }

  const enableApplyButton =
    isBefore(new Date(), new Date(processData.applicationEndDate)) &&
    processData.status === "ACTIVE" &&
    userApplications?.length === 0;

  return (
    <Base pageTitle={processData.name} backBtn>
      <div className="mt-6 rounded-lg bg-white p-6 drop-shadow-sm">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold">{processData.name}</h2>
            <ProcessStatusBadge status={processData.status} />
          </div>
          {enableApplyButton && (
            <button
              className={clsx(
                "btn-primary btn",
                isLoadingCreateApplication && "loading"
              )}
              type="button"
              disabled={isLoadingCreateApplication}
              onClick={() =>
                applyProcess({
                  processId: processData.id,
                })
              }
            >
              Candidatar
            </button>
          )}
          {userApplications && userApplications[0]?.id && (
            <button
              className={clsx("btn-primary btn")}
              type="button"
              disabled={isLoadingCreateApplication}
              onClick={() =>
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                router.push(`/candidato/inscricao/${userApplications[0]?.id}`)
              }
            >
              Visualizar inscrição
            </button>
          )}
        </div>
        <div className="mt-2">
          <h2 className="mt-5 text-2xl font-bold">Período de inscrição</h2>
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
      </div>
    </Base>
  );
};

export default Processo;
