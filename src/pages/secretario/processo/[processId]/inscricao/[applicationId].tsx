import { useState } from "react";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import FileLink from "@/components/FileLink";
import AnalyseUserDocument from "@/components/Modals/AnalyseUserDocument";
import AcceptApplication from "@/components/Modals/AcceptApplication";
import RejectApplication from "@/components/Modals/RejectApplication";
import Base from "@/layout/Base";
import { api } from "@/utils/api";
import {
  modalityMapper,
  modalityTypeMapper,
  vacancyTypeMapper,
} from "@/utils/mapper";
import { formatCEP, maskCpf, maskPhoneNumber } from "@/utils/mask";
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
import { isBefore } from "date-fns";

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

  const isValidAnalysisPeriod = isBefore(
    new Date(),
    new Date(application.process.analysisEndDate)
  );

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
        {application.reasonForRejection && (
          <p className="font-medium text-red-500">
            Motivo da rejeição: {application.reasonForRejection}
          </p>
        )}
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
                  {application.personalDataApplication.phone &&
                    maskPhoneNumber(application.personalDataApplication.phone)}
                </span>
              </p>
              <p className="font-medium">
                Celular:{" "}
                <span className="font-normal">
                  {application.personalDataApplication.mobilePhone &&
                    maskPhoneNumber(
                      application.personalDataApplication.mobilePhone
                    )}
                </span>
              </p>
              <p className="font-medium">
                Celular é WhatsApp?{" "}
                <span className="font-normal">
                  {application.personalDataApplication.isWhatsApp
                    ? "Sim"
                    : "Não"}
                </span>
              </p>
              <p className="font-medium">
                CPF:{" "}
                <span className="font-normal">
                  {application.personalDataApplication.cpf &&
                    maskCpf(application.personalDataApplication.cpf)}
                </span>
              </p>
              <p className="font-medium">
                Número RG:{" "}
                <span className="font-normal">
                  {application.personalDataApplication.rgNumber}
                </span>
              </p>
              <p className="font-medium">
                Orgão emissor do RG:{" "}
                <span className="font-normal">
                  {application.personalDataApplication.rgOrg}
                </span>
              </p>
              <p className="font-medium">
                Estado emisso do RG:{" "}
                <span className="font-normal">
                  {application.personalDataApplication.rgState}
                </span>
              </p>
              <p className="font-medium">
                Data de nascimento:{" "}
                <span className="font-normal">
                  {application.personalDataApplication.birthDate?.toLocaleDateString()}
                </span>
              </p>
              <p className="font-medium">
                Nacionalidade:{" "}
                <span className="font-normal">
                  {application.personalDataApplication.nationality}
                </span>
              </p>
              <p className="font-medium">
                CEP:{" "}
                <span className="font-normal">
                  {application.personalDataApplication.cep &&
                    formatCEP(application.personalDataApplication.cep)}
                </span>
              </p>
              <p className="font-medium">
                Logradouro:{" "}
                <span className="font-normal">
                  {application.personalDataApplication.street}
                </span>
              </p>
              <p className="font-medium">
                Número:{" "}
                <span className="font-normal">
                  {application.personalDataApplication.number}
                </span>
              </p>
              <p className="font-medium">
                Complemento:{" "}
                <span className="font-normal">
                  {application.personalDataApplication.complement ?? "--"}
                </span>
              </p>
              <p className="font-medium">
                Bairro:{" "}
                <span className="font-normal">
                  {application.personalDataApplication.neighborhood}
                </span>
              </p>
              <p className="font-medium">
                Estado:{" "}
                <span className="font-normal">
                  {application.personalDataApplication.state}
                </span>
              </p>
              <p className="font-medium">
                Cidade:{" "}
                <span className="font-normal">
                  {application.personalDataApplication.city}
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
                  {application.registrationDataApplication.vacancyType &&
                    vacancyTypeMapper[
                      application.registrationDataApplication.vacancyType
                    ]}
                </span>
              </p>
              <p className="font-medium">
                Modalidade de vaga:{" "}
                <span className="font-normal">
                  {application.registrationDataApplication.modality &&
                    modalityMapper[
                      application.registrationDataApplication.modality
                    ]}
                </span>
              </p>
              <p className="font-medium">
                Aluno Regular ou especial?{" "}
                <span className="font-normal">
                  {application.registrationDataApplication.modalityType &&
                    modalityTypeMapper[
                      application.registrationDataApplication.modalityType
                    ]}
                </span>
              </p>
              <p className="font-medium">
                Linha de pesquisa:{" "}
                <span className="font-normal">
                  {application.registrationDataApplication.researchLine?.name}
                </span>
              </p>
              {application.registrationDataApplication.modalityType ===
                "REGULAR" && (
                <>
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
                </>
              )}
            </div>
          )}
          {application.registrationDataApplication?.modalityType ===
            "SPECIAL" && (
            <p className="mt-2 font-medium">
              Indicação de tutores:{" "}
              <span className="font-normal">
                {application.registrationDataApplication?.tutors}
              </span>
            </p>
          )}
        </div>

        <hr className="my-5" />

        <div className="mt-5">
          <h3 className="text-xl font-medium">Dados acadêmicos</h3>
          {application.academicDataApplication && (
            <div className="mt-2 grid grid-cols-3 items-center gap-2">
              <p className="font-medium">
                Curso de Graduação:{" "}
                <span className="font-normal">
                  {application.academicDataApplication.course}
                </span>
              </p>
              <p className="font-medium">
                Ano ou previsão de conclusão da graduação:{" "}
                <span className="font-normal">
                  {
                    application.academicDataApplication
                      .completionOrForecastYearCourse
                  }
                </span>
              </p>
              <p className="font-medium">
                Instituição do curso de graduação:{" "}
                <span className="font-normal">
                  {application.academicDataApplication.institutionCourse}
                </span>
              </p>
              {application.academicDataApplication.area && (
                <>
                  <p className="font-medium">
                    Área de mestrado:{" "}
                    <span className="font-normal">
                      {application.academicDataApplication.area}
                    </span>
                  </p>
                  <p className="font-medium">
                    Ano ou previsão de conclusão do mestrado:{" "}
                    <span className="font-normal">
                      {
                        application.academicDataApplication
                          .completionOrForecastYearArea
                      }
                    </span>
                  </p>
                  <p className="font-medium">
                    Instituição do mestrado:{" "}
                    <span className="font-normal">
                      {application.academicDataApplication.institutionArea}
                    </span>
                  </p>
                </>
              )}
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
                          className="flex items-center gap-2"
                          key={userDocument.id}
                        >
                          <div className="basis-[34px]">
                            {getDocumentStatusIcon(
                              userDocument.status || undefined
                            )}
                          </div>
                          <FileLink userDocument={userDocument} />
                          {isValidAnalysisPeriod && (
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
                    <p>Sem documentos.</p>
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
                          className="flex items-center gap-2"
                          key={userDocument.id}
                        >
                          <div className="basis-[34px]">
                            {getDocumentStatusIcon(
                              userDocument.status || undefined
                            )}
                          </div>
                          <FileLink userDocument={userDocument} />
                          {isValidAnalysisPeriod && (
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
                    <p>Sem documentos.</p>
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
                          className="flex items-center gap-2"
                          key={userDocument.id}
                        >
                          <div className="basis-[34px]">
                            {getDocumentStatusIcon(
                              userDocument.status || undefined
                            )}
                          </div>
                          <FileLink userDocument={userDocument} />
                          {isValidAnalysisPeriod && (
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
                    <p>Sem documentos.</p>
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
                          className="flex items-center gap-2"
                          key={userDocument.id}
                        >
                          <div className="basis-[34px]">
                            {getDocumentStatusIcon(
                              userDocument.status || undefined
                            )}
                          </div>
                          <FileLink userDocument={userDocument} />
                          {isValidAnalysisPeriod && (
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
                    <p>Sem documentos.</p>
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
