import { type NextPage } from "next";
import { useRouter } from "next/router";

import { api } from "@/utils/api";
import Base from "@/layout/Base";
import clsx from "clsx";
import { type Process, AnalysisStatus } from "@prisma/client";

const Inscricao: NextPage = () => {
  const router = useRouter();

  const { data: applicationData, isLoading: isLoadingApplicationData } =
    api.application.getUserApplication.useQuery(
      {
        applicationId: router.query.applicationId as string,
      },
      {
        enabled: !!router.query.applicationId,
      }
    );

  if (!router.query.applicationId) {
    return <div>404</div>;
  }

  if (isLoadingApplicationData) {
    return <div>Carregando...</div>;
  }

  if (!applicationData) {
    return <div>404</div>;
  }

  const processBadgeClasses = (status: Process["status"]) =>
    clsx("rounded-full px-2 py-1", {
      badge: status === "DRAFT",
      "badge-info badge": status === "ACTIVE",
      "badge-success badge text-white": status === "FINISHED",
    });

  const applicationStatus = {
    [AnalysisStatus.APPROVED]: "Aprovada",
    [AnalysisStatus.REJECTED]: "Rejeitada",
  };

  const handleClickViewApplication = () => {
    const applicationId = router.query.applicationId as string;
    if (!applicationData.personalDataApplication) {
      return router.push(
        `/candidato/inscricao/${applicationId}/dados-pessoais`
      );
    }
    if (!applicationData.registrationDataApplication) {
      return router.push(
        `/candidato/inscricao/${applicationId}/dados-inscricao`
      );
    }
    if (!applicationData.academicDataApplication) {
      return router.push(
        `/candidato/inscricao/${applicationId}/dados-academicos`
      );
    }
    return router.push(`/candidato/inscricao/${applicationId}/curriculo`);
  };

  return (
    <Base pageTitle="Minhas candidaturas" backBtn>
      <div className="mt-6 rounded-lg bg-white p-6 drop-shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">
              {applicationData.process.name}
            </h2>
            <span
              className={processBadgeClasses(applicationData.process.status)}
            >
              {applicationData.process.status === "DRAFT"
                ? "Não ativo"
                : applicationData.process.status === "ACTIVE"
                ? "Ativo"
                : "Finalizado"}
            </span>
          </div>
          <button
            type="button"
            className="btn-primary btn"
            onClick={handleClickViewApplication}
          >
            Visualizar inscrição
          </button>
        </div>
        <div className="mt-10 flex w-72 flex-col">
          <div className="flex w-full items-center justify-between">
            <p className="font-medium">Dados pessoais</p>
            <span className="badge rounded-full px-2 py-1">
              {applicationData.personalDataApplication?.id
                ? "Preenchido"
                : "Pendente"}
            </span>
          </div>
          <div className="flex w-full items-center justify-between">
            <p className="font-medium">Dados da inscrição</p>
            <span className="badge rounded-full px-2 py-1">
              {applicationData.registrationDataApplication?.id
                ? "Preenchido"
                : "Pendente"}
            </span>
          </div>
          <div className="flex w-full items-center justify-between">
            <p className="font-medium">Dados acadêmicos</p>
            <span className="badge rounded-full px-2 py-1">
              {applicationData.academicDataApplication?.id
                ? "Preenchido"
                : "Pendente"}
            </span>
          </div>
          <div className="flex w-full items-center justify-between">
            <p className="font-medium">Currículo</p>
            <span className="badge rounded-full px-2 py-1">
              {applicationData.UserDocumentApplication.length > 0
                ? "Preenchido"
                : "Pendente"}
            </span>
          </div>
        </div>
        <div className="mt-10">
          <span className="font-medium">Status inscrição: </span>
          {applicationData.status
            ? `Inscrição ${applicationStatus[applicationData.status]}`
            : "Inscrição em andamento"}
        </div>
      </div>
    </Base>
  );
};

export default Inscricao;
