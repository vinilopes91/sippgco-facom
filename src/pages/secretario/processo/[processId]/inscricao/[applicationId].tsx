import { useState } from "react";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import FileLink from "@/components/FileLink";
import AnalyseUserDocument from "@/components/Modals/AnalyseUserDocument";
import AcceptApplication from "@/components/Modals/AcceptApplication";
import RejectApplication from "@/components/Modals/RejectApplication";
import Base from "@/layout/Base";
import { api } from "@/utils/api";
import { modalityMapper, vacancyTypeMapper } from "@/utils/mapper";
import { maskPhoneNumber } from "@/utils/mask";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import {
  AnalysisStatus,
  type Document,
  Step,
  type UserDocumentApplication,
} from "@prisma/client";
import { toast } from "react-hot-toast";
import { analysisStatusMapper } from "@/utils/mapper";
import { isValidPeriod } from "@/utils/application";
import clsx from "clsx";

const UserApplication: NextPage = () => {
  const [userDocumentSelected, setUserDocumentSelected] = useState<
    UserDocumentApplication & { document: Document }
  >();
  const [openAnalysisDocumentModal, setOpenAnalysisDocumentModal] =
    useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);

  const router = useRouter();
  const applicationId = router.query.applicationId as string;

  const { data: application, isLoading: isLoadingApplication } =
    api.application.get.useQuery(
      {
        applicationId,
      },
      {
        enabled: !!applicationId,
      }
    );

  if (!applicationId) {
    return <div>404</div>;
  }

  if (isLoadingApplication) {
    return <div>Carregando</div>;
  }

  if (!application) {
    return <div>404</div>;
  }

  const personalDataDocuments = application.UserDocumentApplication.filter(
    (userDocument) => userDocument.step === Step.PERSONAL_DATA
  );
  const registrationDataDocuments = application.UserDocumentApplication.filter(
    (userDocument) => userDocument.step === Step.REGISTRATION_DATA
  );
  const academicDataDocuments = application.UserDocumentApplication.filter(
    (userDocument) => userDocument.step === Step.ACADEMIC_DATA
  );
  const curriculumDocuments = application.UserDocumentApplication.filter(
    (userDocument) => userDocument.step === Step.CURRICULUM
  );

  const getDocumentStatusIcon = (status?: AnalysisStatus) => {
    if (!status) {
      return (
        <ExclamationCircleIcon
          width={34}
          className="stroke-warning"
          title="Pendente"
        />
      );
    }
    const statusIcon = {
      [AnalysisStatus.APPROVED]: (
        <CheckCircleIcon
          width={34}
          className="stroke-success"
          title="Aprovado"
        />
      ),
      [AnalysisStatus.REJECTED]: (
        <PlusCircleIcon
          width={34}
          className="rotate-45 stroke-error"
          title="Rejeitado"
        />
      ),
    };
    return statusIcon[status];
  };

  const handleClickAnalyseButton = (
    userDocument: UserDocumentApplication & { document: Document }
  ) => {
    setUserDocumentSelected(userDocument);
    setOpenAnalysisDocumentModal(true);
  };

  const allDocumentsAnalysed = application.UserDocumentApplication.every(
    (userDocument) => !!userDocument.status
  );

  const isValidApplicationPeriod = isValidPeriod({
    applicationEndDate: application.process.applicationEndDate,
    applicationStartDate: application.process.applicationStartDate,
  });

  const handleClickRejectButton = () => {
    if (!allDocumentsAnalysed) {
      toast.error("Todos os documentos devem ser analisados");
      return;
    }
    if (isValidApplicationPeriod) {
      toast.error("Período de inscrição ainda não acabou");
      return;
    }
    setOpenRejectModal(true);
  };

  const handleClickAcceptButton = () => {
    if (!allDocumentsAnalysed) {
      toast.error("Todos os documentos devem ser analisados");
      return;
    }
    if (isValidApplicationPeriod) {
      toast.error("Período de inscrição ainda não acabou");
      return;
    }
    setOpenApproveModal(true);
  };

  return (
    <Base pageTitle="Análise da inscrição" backBtn>
      <div className="my-6 rounded-lg bg-white p-6 drop-shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Dados do candidato</h2>
          {application.status && (
            <span
              className={clsx("badge", {
                "badge-success text-white": application.status === "APPROVED",
                "badge-error text-white": application.status === "REJECTED",
              })}
            >
              Inscrição {analysisStatusMapper[application.status]}
            </span>
          )}
        </div>
        <div className="mt-5">
          <h3 className="text-xl font-medium">Dados pessoais</h3>
          {application.personalDataApplication && (
            <div className="mt-2 grid grid-cols-3 items-center gap-2">
              <p className="font-medium">
                Nome:{" "}
                <span className="font-normal">{application.user.name}</span>
              </p>
              <p className="font-medium">
                E-mail:{" "}
                <span className="font-normal">{application.user.email}</span>
              </p>
              <p className="font-medium">
                Telefone:{" "}
                <span className="font-normal">
                  {maskPhoneNumber(application.personalDataApplication.phone)}
                </span>
              </p>
            </div>
          )}
        </div>

        <hr className="my-5" />

        <div className="mt-5">
          <h3 className="text-xl font-medium">Dados inscrição</h3>
          {application.registrationDataApplication && (
            <div className="mt-2 grid grid-cols-3 items-center gap-2">
              <p className="font-medium">
                Tipo de vaga:{" "}
                <span className="font-normal">
                  {
                    vacancyTypeMapper[
                      application.registrationDataApplication.vacancyType
                    ]
                  }
                </span>
              </p>
              <p className="font-medium">
                Modalidade de vaga:{" "}
                <span className="font-normal">
                  {
                    modalityMapper[
                      application.registrationDataApplication.modality
                    ]
                  }
                </span>
              </p>
              <p className="font-medium">
                Linha de pesquisa:{" "}
                <span className="font-normal">
                  {application.registrationDataApplication.researchLine.name}
                </span>
              </p>
              <p className="font-medium">
                Concorre como aluno especial?{" "}
                <span className="font-normal">
                  {application.registrationDataApplication.specialStudent
                    ? "Sim"
                    : "Não"}
                </span>
              </p>
              <p className="font-medium">
                Tem interesse em bolsa de estudo?{" "}
                <span className="font-normal">
                  {application.registrationDataApplication.scholarship
                    ? "Sim"
                    : "Não"}
                </span>
              </p>
            </div>
          )}
        </div>

        <hr className="my-5" />

        <div className="mt-5">
          <h3 className="text-xl font-medium">Dados acadêmicos</h3>
          {application.academicDataApplication && (
            <div className="mt-2 grid grid-cols-3 items-center gap-2">
              <p className="font-medium">
                Curso/Área:{" "}
                <span className="font-normal">
                  {application.academicDataApplication.courseArea}
                </span>
              </p>
              <p className="font-medium">
                Ano ou previsão de conclusão:{" "}
                <span className="font-normal">
                  {application.academicDataApplication.completionOrForecastYear}
                </span>
              </p>
              <p className="font-medium">
                Instituição:{" "}
                <span className="font-normal">
                  {application.academicDataApplication.institution}
                </span>
              </p>
              <p className="font-medium">
                Foi aluno especial?{" "}
                <span className="font-normal">
                  {application.academicDataApplication.wasSpecialStudent
                    ? "Sim"
                    : "Não"}
                </span>
              </p>
            </div>
          )}
        </div>

        <hr className="my-5" />

        {application.UserDocumentApplication && (
          <>
            <h3 className="text-2xl font-medium">Documentos</h3>
            <div className="flex flex-col gap-2">
              <div className="mt-5 flex w-full flex-col">
                <h2 className="text-xl font-medium">Dados pessoais</h2>
                <div className="mt-2 flex flex-col gap-2">
                  {personalDataDocuments.length > 0 ? (
                    personalDataDocuments.map((userDocument) => (
                      <>
                        <div
                          className="flex items-center"
                          key={userDocument.id}
                        >
                          <div className="basis-[34px]">
                            {getDocumentStatusIcon(
                              userDocument.status || undefined
                            )}
                          </div>
                          <FileLink userDocument={userDocument} />
                          {isValidApplicationPeriod && (
                            <button
                              className="btn-primary btn-sm btn"
                              onClick={() =>
                                handleClickAnalyseButton(userDocument)
                              }
                            >
                              {userDocument.status
                                ? "Mudar analise"
                                : "Analisar"}
                            </button>
                          )}
                        </div>
                        {userDocument.reasonForRejection && (
                          <p className="truncate text-left text-sm">
                            <span className="font-medium">
                              Motivo da rejeição:{" "}
                            </span>
                            {userDocument.reasonForRejection}
                          </p>
                        )}
                      </>
                    ))
                  ) : (
                    <p>Nehum documento enviado</p>
                  )}
                </div>
              </div>
              <div className="flex w-full flex-col">
                <h2 className="text-xl font-medium">Dados da inscrição</h2>
                <div className="mt-2 flex flex-col gap-2">
                  {registrationDataDocuments.length > 0 ? (
                    registrationDataDocuments.map((userDocument) => (
                      <>
                        <div
                          className="flex items-center"
                          key={userDocument.id}
                        >
                          <div className="basis-[34px]">
                            {getDocumentStatusIcon(
                              userDocument.status || undefined
                            )}
                          </div>
                          <FileLink userDocument={userDocument} />
                          {isValidApplicationPeriod && (
                            <button
                              className="btn-primary btn-sm btn"
                              onClick={() =>
                                handleClickAnalyseButton(userDocument)
                              }
                            >
                              {userDocument.status
                                ? "Mudar analise"
                                : "Analisar"}
                            </button>
                          )}
                        </div>
                        {userDocument.reasonForRejection && (
                          <p className="truncate text-left text-sm">
                            <span className="font-medium">
                              Motivo da rejeição:{" "}
                            </span>
                            {userDocument.reasonForRejection}
                          </p>
                        )}
                      </>
                    ))
                  ) : (
                    <p>Nehum documento enviado</p>
                  )}
                </div>
              </div>
              <div className="flex w-full flex-col">
                <h2 className="text-xl font-medium">Dados acadêmicos</h2>
                <div className="mt-2 flex flex-col">
                  {academicDataDocuments.length > 0 ? (
                    academicDataDocuments.map((userDocument) => (
                      <>
                        <div
                          className="flex items-center"
                          key={userDocument.id}
                        >
                          <div className="basis-[34px]">
                            {getDocumentStatusIcon(
                              userDocument.status || undefined
                            )}
                          </div>
                          <FileLink userDocument={userDocument} />
                          {isValidApplicationPeriod && (
                            <button
                              className="btn-primary btn-sm btn"
                              onClick={() =>
                                handleClickAnalyseButton(userDocument)
                              }
                            >
                              {userDocument.status
                                ? "Mudar analise"
                                : "Analisar"}
                            </button>
                          )}
                        </div>
                        {userDocument.reasonForRejection && (
                          <p className="truncate text-left text-sm">
                            <span className="font-medium">
                              Motivo da rejeição:{" "}
                            </span>
                            {userDocument.reasonForRejection}
                          </p>
                        )}
                      </>
                    ))
                  ) : (
                    <p>Nehum documento enviado</p>
                  )}
                </div>
              </div>
              <div className="flex w-full flex-col">
                <h2 className="text-xl font-medium">Currículo</h2>
                <div className="mt-2 flex flex-col gap-2">
                  {curriculumDocuments.length > 0 ? (
                    curriculumDocuments.map((userDocument) => (
                      <>
                        <div
                          className="flex items-center"
                          key={userDocument.id}
                        >
                          <div className="basis-[34px]">
                            {getDocumentStatusIcon(
                              userDocument.status || undefined
                            )}
                          </div>
                          <FileLink userDocument={userDocument} />
                          {isValidApplicationPeriod && (
                            <button
                              className="btn-primary btn-sm btn"
                              onClick={() =>
                                handleClickAnalyseButton(userDocument)
                              }
                            >
                              {userDocument.status
                                ? "Mudar analise"
                                : "Analisar"}
                            </button>
                          )}
                        </div>
                        {userDocument.reasonForRejection && (
                          <p className="truncate text-left text-sm">
                            <span className="font-medium">
                              Motivo da rejeição:{" "}
                            </span>
                            {userDocument.reasonForRejection}
                          </p>
                        )}
                      </>
                    ))
                  ) : (
                    <p>Nehum documento enviado</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        {!application.status && (
          <>
            <hr className="my-5" />
            <div className="flex w-full justify-end gap-4">
              <button
                className="btn-primary btn"
                onClick={handleClickRejectButton}
              >
                Rejeitar candidatura
              </button>
              <button
                className="btn-primary btn"
                onClick={handleClickAcceptButton}
              >
                Deferir candidatura
              </button>
            </div>
          </>
        )}
      </div>
      {userDocumentSelected && (
        <AnalyseUserDocument
          userDocument={userDocumentSelected}
          onClose={() => setOpenAnalysisDocumentModal(false)}
          open={openAnalysisDocumentModal}
        />
      )}
      <AcceptApplication
        applicantName={application.user.name}
        applicationId={application.id}
        open={openApproveModal}
        onClose={() => setOpenApproveModal(false)}
      />
      <RejectApplication
        applicantName={application.user.name}
        applicationId={application.id}
        open={openRejectModal}
        onClose={() => setOpenRejectModal(false)}
      />
    </Base>
  );
};

export default UserApplication;
