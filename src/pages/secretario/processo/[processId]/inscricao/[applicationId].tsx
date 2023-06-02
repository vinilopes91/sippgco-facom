import FileLink from "@/components/FileLink";
import Base from "@/layout/Base";
import { api } from "@/utils/api";
import { modalityMapper, vacancyTypeMapper } from "@/utils/mapper";
import { maskPhoneNumber } from "@/utils/mask";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { AnalysisStatus, Step } from "@prisma/client";
import { type NextPage } from "next";
import { useRouter } from "next/router";

const UserApplication: NextPage = () => {
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

  return (
    <Base pageTitle="Análise da inscrição" backBtn>
      <div className="my-6 rounded-lg bg-white p-6 drop-shadow-sm">
        <h2 className="text-2xl font-bold">Dados do candidato</h2>
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
                      <div
                        className="flex items-center gap-2"
                        key={userDocument.id}
                      >
                        {getDocumentStatusIcon(
                          userDocument.status || undefined
                        )}
                        <FileLink userDocument={userDocument} />
                        <button className="btn-primary btn-sm btn">
                          {userDocument.status ? "Mudar analise" : "Analisar"}
                        </button>
                      </div>
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
                      <div
                        className="flex items-center gap-2"
                        key={userDocument.id}
                      >
                        {getDocumentStatusIcon(
                          userDocument.status || undefined
                        )}
                        <FileLink userDocument={userDocument} />
                        <button className="btn-primary btn-sm btn">
                          {userDocument.status ? "Mudar analise" : "Analisar"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>Nehum documento enviado</p>
                  )}
                </div>
              </div>
              <div className="flex w-full flex-col">
                <h2 className="text-xl font-medium">Dados acadêmicos</h2>
                <div className="mt-2 flex flex-col gap-2">
                  {academicDataDocuments.length > 0 ? (
                    academicDataDocuments.map((userDocument) => (
                      <div
                        className="flex items-center gap-2"
                        key={userDocument.id}
                      >
                        {getDocumentStatusIcon(
                          userDocument.status || undefined
                        )}
                        <FileLink userDocument={userDocument} />
                        <button className="btn-primary btn-sm btn">
                          {userDocument.status ? "Mudar analise" : "Analisar"}
                        </button>
                      </div>
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
                      <div
                        className="flex items-center gap-2"
                        key={userDocument.id}
                      >
                        {getDocumentStatusIcon(
                          userDocument.status || undefined
                        )}
                        <FileLink userDocument={userDocument} />
                        <button className="btn-primary btn-sm btn">
                          {userDocument.status ? "Mudar analise" : "Analisar"}
                        </button>
                      </div>
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
            {/* Validar se período de inscrição do processo já acabou e se todos os documentos foram validados */}
            <div className="flex w-full justify-end gap-4">
              <button className="btn-primary btn">Rejeitar candidatura</button>
              <button className="btn-primary btn">Deferir candidatura</button>
            </div>
          </>
        )}
      </div>
    </Base>
  );
};

export default UserApplication;
