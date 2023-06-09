import { type NextPage } from "next";
import { useRouter } from "next/router";

import { api } from "@/utils/api";
import Base from "@/layout/Base";
import ApplicationStepper from "@/components/ApplicationStepper";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type FinalizeAcademicDataApplicationSchema,
  finalizeAcademicDataApplicationSchema,
  type UpdateAcademicDataApplicationSchema,
} from "@/common/validation/academicDataApplication";
import Input from "@/components/Input";
import StepFileInput from "@/components/StepFileInput/StepFileInput";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { handleTRPCError } from "@/utils/errors";
import clsx from "clsx";
import { NumberFormatBase } from "react-number-format";
import { filterProcessStepDocuments } from "@/utils/filterDocuments";
import { isValidPeriod } from "@/utils/application";

const AcademicData: NextPage = () => {
  const router = useRouter();
  const ctx = api.useContext();

  const { register, handleSubmit, formState, setValue, control, trigger, getValues, clearErrors } =
    useForm<FinalizeAcademicDataApplicationSchema>({
      resolver: zodResolver(finalizeAcademicDataApplicationSchema),
    });

  const { errors } = formState;

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

  useEffect(() => {
    if (applicationData) {
      setValue("applicationId", applicationData.id);
    }
    if (applicationData?.academicDataApplication) {
      applicationData.academicDataApplication.completionOrForecastYearCourse && setValue(
        "completionOrForecastYearCourse",
        applicationData.academicDataApplication.completionOrForecastYearCourse
      );
      applicationData.academicDataApplication.course && setValue("course", applicationData.academicDataApplication.course);
      applicationData.academicDataApplication.institutionCourse && setValue(
        "institutionCourse",
        applicationData.academicDataApplication.institutionCourse
      );
      applicationData.academicDataApplication.completionOrForecastYearArea && setValue(
        "completionOrForecastYearArea",
        applicationData.academicDataApplication.completionOrForecastYearArea
      );
      applicationData.academicDataApplication.area && setValue("area", applicationData.academicDataApplication.area);
      applicationData.academicDataApplication.institutionArea && setValue(
        "institutionArea",
        applicationData.academicDataApplication.institutionArea
      );
      applicationData.academicDataApplication.completionOrForecastYearArea &&
        setValue(
          "completionOrForecastYearArea",
          applicationData.academicDataApplication.completionOrForecastYearArea
        );
      applicationData.academicDataApplication.area &&
        setValue("area", applicationData.academicDataApplication.area);
      applicationData.academicDataApplication.institutionArea &&
        setValue(
          "institutionArea",
          applicationData.academicDataApplication.institutionArea
        );
      applicationData.academicDataApplication.wasSpecialStudent && setValue(
        "wasSpecialStudent",
        applicationData.academicDataApplication.wasSpecialStudent
      );
    }
  }, [applicationData, setValue]);

  const {
    data: academicDataDocuments,
    isLoading: isLoadingAcademicDataDocuments,
  } = api.processDocuments.listProcessDocuments.useQuery(
    {
      processId: applicationData?.processId as string,
      step: "ACADEMIC_DATA",
    },
    {
      enabled: !!applicationData?.processId,
    }
  );

  const {
    mutateAsync: finalizeAcademicDataApplication,
    isLoading: finalizingAcademicDataApplication,
  } = api.academicDataApplication.finalize.useMutation({
    onSuccess: () => {
      void ctx.application.getUserApplication.invalidate({
        applicationId: router.query.applicationId as string,
      });
    },
  });
  const {
    mutate: updateAcademicDataApplication,
    isLoading: updatingAcademicDataApplication,
  } = api.academicDataApplication.update.useMutation({
    onSuccess: () => {
      toast.success("Dados academicos salvos com sucesso.");
      clearErrors();
      void ctx.application.getUserApplication.invalidate({
        applicationId: router.query.applicationId as string,
      });
    },
    onError: (error) => {
      handleTRPCError(error, "Erro ao salvar dados acadêmicos.");
    },
  });

  if (!router.query.applicationId) {
    return <div>404</div>;
  }

  if (isLoadingApplicationData || isLoadingAcademicDataDocuments) {
    return <div>Carregando...</div>;
  }

  if (!applicationData || !academicDataDocuments) {
    return <div>404</div>;
  }

  const userStepDocuments = filterProcessStepDocuments({
    documents: academicDataDocuments,
    modality: applicationData.registrationDataApplication?.modality,
    vacancyType: applicationData.registrationDataApplication?.vacancyType,
    step: "ACADEMIC_DATA",
  });

  const requiredDocuments = userStepDocuments?.filter(
    (processDocument) => processDocument.document.required
  );

  const handleClickSaveButton = async () => {
    await trigger();
    const formValues = getValues();

    const updateInput: UpdateAcademicDataApplicationSchema = formValues;
    (Object.keys(updateInput) as (keyof typeof updateInput)[]).forEach(
      (key) => {
        if (!updateInput[key]) {
          delete updateInput[key];
        }
      }
    );

    updateAcademicDataApplication(updateInput);
  };

  const onSubmit = async (data: FinalizeAcademicDataApplicationSchema) => {
    const disableSubmit = requiredDocuments.some((processDocument) => {
      const document = applicationData.UserDocumentApplication.find(
        (userDocument) => userDocument.documentId === processDocument.documentId
      );

      return !document;
    });

    if (disableSubmit) {
      toast.error("Você precisa enviar todos os documentos obrigatórios");
      return;
    }

    try {
      await finalizeAcademicDataApplication(data);
      await router.push(
        `/candidato/inscricao/${applicationData.id}/curriculo`
      );
    } catch (error) {
      handleTRPCError(error, "Erro ao registrar dados acadêmicos.");
    }
  };

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
          <ApplicationStepper currentStep={3} application={applicationData} />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="mt-6 flex flex-col">
            <h3 className="text-lg font-medium">Dados acadêmicos</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Input
                  label="Curso de graduação"
                  placeholder="Curso de graduação"
                  name="course"
                  register={register}
                  error={errors.course}
                  disabled={!isValidApplicationPeriod}
                  required
                />
              </div>
              <Controller
                control={control}
                name="completionOrForecastYearCourse"
                render={({ field: { name, value } }) => (
                  <NumberFormatBase
                    name={name}
                    value={value}
                    id="completionOrForecastYearCourse"
                    minLength={4}
                    maxLength={4}
                    label="Ano ou previsão de conclusão da graduação"
                    placeholder="XXXX"
                    required
                    error={errors.completionOrForecastYearCourse}
                    customInput={Input<FinalizeAcademicDataApplicationSchema>}
                    disabled={
                      !isValidApplicationPeriod || isLoadingApplicationData
                    }
                    register={register}
                    onValueChange={(values) => {
                      setValue("completionOrForecastYearCourse", values.value);
                    }}
                  />
                )}
              />
              <Input
                label="Instituição do curso de graduação"
                placeholder="Instituição do curso de graduação"
                name="institutionCourse"
                register={register}
                error={errors.institutionCourse}
                required
                disabled={!isValidApplicationPeriod}
              />
            </div>

            {applicationData.registrationDataApplication?.modality === "DOCTORATE" && <div className="grid grid-cols-3 gap-2">
              <Input
                label="Área de mestrado"
                placeholder="Área de mestrado"
                name="area"
                register={register}
                error={errors.area}
                disabled={!isValidApplicationPeriod}
                required
              />
              <Controller
                control={control}
                name="completionOrForecastYearArea"
                render={({ field: { name, value } }) => (
                  <NumberFormatBase
                    name={name}
                    value={value}
                    id="completionOrForecastYearArea"
                    minLength={4}
                    maxLength={4}
                    label="Ano ou previsão de conclusão do mestrado"
                    placeholder="XXXX"
                    required
                    error={errors.completionOrForecastYearArea}
                    customInput={Input<FinalizeAcademicDataApplicationSchema>}
                    disabled={
                      !isValidApplicationPeriod || isLoadingApplicationData
                    }
                    register={register}
                    onValueChange={(values) => {
                      setValue("completionOrForecastYearArea", values.value);
                    }}
                  />
                )}
              />
              <Input
                label="Instituição do mestrado"
                placeholder="Instituição do mestrado"
                name="institutionArea"
                register={register}
                error={errors.institutionArea}
                required
                disabled={!isValidApplicationPeriod}
              />
            </div>}

            <div className="mt-2 flex items-center gap-2">
              <input
                className="checkbox"
                type="checkbox"
                id="wasSpecialStudent"
                disabled={!isValidApplicationPeriod}
                {...register("wasSpecialStudent")}
              />
              <label htmlFor="wasSpecialStudent">
                Fui aluno especial do Programa de Pós-graduação da Ciência da
                Computação da UFU
              </label>
            </div>
          </div>

          {(!applicationData.registrationDataApplication?.modality ||
            !applicationData.registrationDataApplication?.vacancyType) && (
            <div>
              <p className="font-medium">
                * Selecione o tipo e modalidade de vaga na etapa 2 (Dados da
                inscrição) para carregar os documentos necessários
              </p>
            </div>
          )}

          {isLoadingAcademicDataDocuments && (
            <div className="mt-4 flex animate-pulse flex-col">
              <h3 className="h-6 w-48 rounded bg-slate-200 text-lg font-medium"></h3>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="h-[30px] w-full rounded bg-slate-200"></div>
                <div className="h-[30px] w-full rounded bg-slate-200"></div>
                <div className="h-[30px] w-full rounded bg-slate-200"></div>
              </div>
            </div>
          )}
          {userStepDocuments && userStepDocuments.length > 0 && (
            <div className="mt-4 flex flex-col">
              <h3 className="text-lg font-medium">Documentos</h3>
              <div className="grid grid-cols-3 gap-2">
                {userStepDocuments.map(({ document, documentId }) => (
                  <StepFileInput
                    key={documentId}
                    applicationData={applicationData}
                    document={document}
                    documentId={documentId}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="mt-5 flex items-center justify-between gap-2">
            <button
              className="btn-primary btn w-36"
              onClick={() =>
                router.push(
                  `/candidato/inscricao/${applicationData.id}/dados-inscricao`
                )
              }
              type="button"
            >
              Voltar
            </button>
            <div className="flex items-center gap-2">
              <button
                className={clsx(
                  "btn-primary btn",
                  updatingAcademicDataApplication && "loading"
                )}
                disabled={
                  !isValidApplicationPeriod || updatingAcademicDataApplication
                }
                type="button"
                onClick={handleClickSaveButton}
              >
                Salvar dados
              </button>
              <button
                className={clsx(
                  "btn-primary btn",
                  finalizingAcademicDataApplication && "loading"
                )}
                disabled={
                  !isValidApplicationPeriod || finalizingAcademicDataApplication
                }
                type="submit"
              >
                Finalizar etapa
              </button>
            </div>
          </div>
          {!isValidApplicationPeriod && (
            <p className="text-right text-sm text-red-500">
              * Período de inscrição encerrado
            </p>
          )}
        </form>
      </div>
    </Base>
  );
};

export default AcademicData;
