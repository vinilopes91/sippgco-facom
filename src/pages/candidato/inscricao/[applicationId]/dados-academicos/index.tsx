import { type NextPage } from "next";
import { useRouter } from "next/router";

import { api } from "@/utils/api";
import Base from "@/layout/Base";
import ApplicationStepper from "@/components/ApplicationStepper";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type CreateAcademicDataApplicationSchema,
  createAcademicDataApplicationSchema,
} from "@/common/validation/academicDataApplication";
import Input from "@/components/Input";
import StepFileInput from "@/components/StepFileInput/StepFileInput";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { handleTRPCError } from "@/utils/errors";
import clsx from "clsx";
import { NumberFormatBase } from "react-number-format";

const AcademicData: NextPage = () => {
  const router = useRouter();
  const ctx = api.useContext();

  const { register, handleSubmit, formState, setValue, control } =
    useForm<CreateAcademicDataApplicationSchema>({
      resolver: zodResolver(createAcademicDataApplicationSchema),
    });

  const { errors } = formState;

  const { data: applicationData, isLoading: isLoadingApplicationData } =
    api.application.getUserApplication.useQuery(
      {
        applicationId: router.query.applicationId as string,
      },
      {
        enabled: !!router.query.applicationId,
      }
    );

  useEffect(() => {
    if (applicationData) {
      setValue("applicationId", applicationData.id);
    }
    if (applicationData?.academicDataApplication) {
      setValue(
        "completionOrForecastYear",
        applicationData.academicDataApplication.completionOrForecastYear
      );
      setValue(
        "courseArea",
        applicationData.academicDataApplication.courseArea
      );
      setValue(
        "institution",
        applicationData.academicDataApplication.institution
      );
      setValue(
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
    mutateAsync: createAcademicDataApplication,
    isLoading: creatingAcademicDataApplication,
  } = api.academicDataApplication.create.useMutation();
  const {
    mutate: updateAcademicDataApplication,
    isLoading: updatingAcademicDataApplication,
  } = api.academicDataApplication.update.useMutation({
    onSuccess: () => {
      toast.success("Dados pessoais salvos com sucesso.");
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

  const academicDataApplicationId = applicationData.academicDataApplication?.id;

  const requiredDocuments = academicDataDocuments?.filter(
    (processDocument) => processDocument.document.required
  );

  const onSubmit = async (data: CreateAcademicDataApplicationSchema) => {
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

    if (academicDataApplicationId) {
      updateAcademicDataApplication({
        id: academicDataApplicationId,
        ...data,
      });
    } else {
      try {
        await createAcademicDataApplication(data);
        await router.push(
          `/candidato/inscricao/${applicationData.id}/curriculo`
        );
      } catch (error) {
        handleTRPCError(error, "Erro ao registrar dados acadêmicos.");
      }
    }
    void ctx.application.invalidate();
  };

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
          <ApplicationStepper currentStep={3} />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="mt-6 flex flex-col">
            <h3 className="text-lg font-medium">Dados acadêmicos</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Input
                  label="Curso/Área"
                  placeholder="Curso/Área"
                  name="courseArea"
                  register={register}
                  error={errors.courseArea}
                  required
                />
                <p className="mt-1 text-xs">
                  * Curso de graduação ou área do mestrado para candidatos a
                  doutorado
                </p>
              </div>
              {/* <Input
                label="Ano ou previsão de conclusão"
                placeholder="XXXX"
                name="completionOrForecastYear"
                register={register}
                minLength={4}
                maxLength={4}
                error={errors.completionOrForecastYear}
                required
              /> */}
              <Controller
                control={control}
                name="completionOrForecastYear"
                render={({ field: { name, value } }) => (
                  <NumberFormatBase
                    name={name}
                    value={value}
                    id="completionOrForecastYear"
                    minLength={4}
                    maxLength={4}
                    label="Ano ou previsão de conclusão"
                    placeholder="XXXX"
                    required
                    error={errors.completionOrForecastYear}
                    customInput={Input<CreateAcademicDataApplicationSchema>}
                    disabled={isLoadingApplicationData}
                    register={register}
                    onValueChange={(values) => {
                      setValue("completionOrForecastYear", values.value);
                    }}
                  />
                )}
              />
              <Input
                label="Instituição"
                placeholder="Instituição"
                name="institution"
                register={register}
                error={errors.institution}
                required
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                className="checkbox"
                type="checkbox"
                id="wasSpecialStudent"
                {...register("wasSpecialStudent")}
              />
              <label htmlFor="wasSpecialStudent">
                Fui aluno especial do Programa de Pós-graduação da Ciência da
                Computação da UFU
              </label>
            </div>
          </div>

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
          {academicDataDocuments && academicDataDocuments.length > 0 && (
            <div className="mt-4 flex flex-col">
              <h3 className="text-lg font-medium">Documentos</h3>
              <div className="grid grid-cols-3 gap-2">
                {academicDataDocuments.map(({ document, documentId }) => (
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
          <div className="flex items-center justify-end">
            {academicDataApplicationId ? (
              <button
                className={clsx(
                  "btn-primary btn w-36",
                  updatingAcademicDataApplication && "loading"
                )}
                disabled={updatingAcademicDataApplication}
                type="submit"
              >
                Salvar
              </button>
            ) : (
              <button
                className={clsx(
                  "btn-primary btn w-36",
                  creatingAcademicDataApplication && "loading"
                )}
                disabled={creatingAcademicDataApplication}
                type="submit"
              >
                Avançar
              </button>
            )}
          </div>
        </form>
      </div>
    </Base>
  );
};

export default AcademicData;
