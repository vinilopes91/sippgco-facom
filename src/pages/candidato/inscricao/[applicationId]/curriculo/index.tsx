import { type NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Base from "@/layout/Base";
import ApplicationStepper from "@/components/ApplicationStepper";
import clsx from "clsx";
import CurriculumFileInput from "@/components/CurriculumFileInput/CurriculumFileInput";
import { handleTRPCError } from "@/utils/errors";
import { filterProcessStepDocuments } from "@/utils/filterDocuments";
import { isValidPeriod } from "@/utils/application";

const Curriculum: NextPage = () => {
  const router = useRouter();
  const ctx = api.useContext();

  const { data: applicationData, isLoading: isLoadingApplicationData } =
    api.application.getUserApplication.useQuery(
      {
        applicationId: router.query.applicationId as string,
      },
      {
        enabled: !!router.query.applicationId,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      }
    );

  const { data: curriculumDocuments, isLoading: isLoadingCurriculumDocuments } =
    api.processDocuments.listProcessDocuments.useQuery(
      {
        processId: applicationData?.processId as string,
        step: "CURRICULUM",
      },
      {
        enabled: !!applicationData?.processId,
      }
    );

  const { mutate: finishApplication, isLoading: isFinishingApplication } =
    api.application.finishApplicationFill.useMutation({
      onSuccess: async () => {
        await ctx.application.invalidate();
        return router.push(
          `/candidato/inscricao/${router.query.applicationId as string}`
        );
      },
      onError: (e) => {
        handleTRPCError(
          e,
          "Falha ao finalizar inscrição! Tente novamente mais tarde."
        );
      },
    });

  if (!router.query.applicationId) {
    return <div>404</div>;
  }

  if (isLoadingApplicationData || isLoadingCurriculumDocuments) {
    return <div>Carregando...</div>;
  }

  if (!applicationData || !curriculumDocuments) {
    return <div>404</div>;
  }

  const userStepDocuments = filterProcessStepDocuments({
    documents: curriculumDocuments,
    modality: applicationData.registrationDataApplication?.modality,
    vacancyType: applicationData.registrationDataApplication?.vacancyType,
    step: "CURRICULUM",
  });

  const requiredDocuments = userStepDocuments?.filter(
    (processDocument) => processDocument.document.required
  );

  const isValidApplicationPeriod = isValidPeriod({
    applicationStartDate: applicationData.process.applicationStartDate,
    applicationEndDate: applicationData.process.applicationEndDate,
  });

  return (
    <Base
      pageTitle="Minhas candidaturas"
      backBtn
      backBtnFn={() =>
        router.push(
          `/candidato/inscricao/${router.query.applicationId as string}`
        )
      }
    >
      <div className="mt-6 rounded-lg bg-white p-6 drop-shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{applicationData.process.name}</h2>
        </div>
        <div className="my-4 flex justify-center">
          <ApplicationStepper currentStep={4} />
        </div>
        <div className="flex flex-col gap-4">
          {userStepDocuments.map(({ document, documentId }) => (
            <CurriculumFileInput
              key={documentId}
              applicationData={applicationData}
              document={document}
              documentId={documentId}
            />
          ))}
        </div>
        <div className="mt-[50px] flex w-full items-center justify-end">
          <button
            className={clsx(
              "btn-primary btn w-36",
              isFinishingApplication && "loading"
            )}
            disabled={
              requiredDocuments.length > 0 ||
              isFinishingApplication ||
              !isValidApplicationPeriod
            }
            type="button"
            onClick={() =>
              finishApplication({ applicationId: applicationData.id })
            }
          >
            Concluir
          </button>
        </div>
        {!isValidApplicationPeriod && (
          <p className="mt-5 text-right text-sm text-red-500">
            * Período de inscrição encerrado
          </p>
        )}
      </div>
    </Base>
  );
};

export default Curriculum;
