import { type NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Base from "@/layout/Base";
import ApplicationStepper from "@/components/ApplicationStepper";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  finalizeRegistrationDataApplicationSchema,
  type UpdateRegistrationDataApplicationSchema,
  type FinalizeRegistrationDataApplicationSchema,
} from "@/common/validation/registrationDataApplication";
import { useForm } from "react-hook-form";
import Select from "@/components/Select";
import { Modality, ModalityType, VacancyType } from "@prisma/client";
import { modalityMapper, modalityTypeMapper, vacancyTypeMapper } from "@/utils/mapper";
import StepFileInput from "@/components/StepFileInput/StepFileInput";
import { useEffect } from "react";
import { handleTRPCError } from "@/utils/errors";
import { toast } from "react-hot-toast";
import clsx from "clsx";
import { filterProcessStepDocuments } from "@/utils/filterDocuments";
import { isValidPeriod } from "@/utils/application";
import TextArea from "@/components/TextArea";

const RegistrationData: NextPage = () => {
  const router = useRouter();
  const ctx = api.useContext();

  const { register, handleSubmit, formState, setValue, watch, trigger, getValues, clearErrors } =
    useForm<FinalizeRegistrationDataApplicationSchema>({
      resolver: zodResolver(finalizeRegistrationDataApplicationSchema),
    });

  const { errors } = formState;

  const [modalityWatch, vacancyTypeWatch, modalityTypeWatch, researchLineWatch] = watch(["modality", "vacancyType", "modalityType", "researchLineId"]);

  useEffect(() => {
    if (modalityTypeWatch === "SPECIAL") {
      setValue("scholarship", false);
      setValue("specialStudent", false);
    } else if (modalityTypeWatch === "REGULAR") {
      setValue("tutors", undefined);
    }
  }, [modalityTypeWatch, setValue])

  const { data: researchLine, isLoading: isLoadingResearchLine } = api.researchLine.get.useQuery({
    id: researchLineWatch
  }, {
    enabled: !!researchLineWatch,
  })

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

  const {
    data: registrationDataDocuments,
    isLoading: isLoadingRegistrationDataDocuments,
  } = api.processDocuments.listProcessDocuments.useQuery(
    {
      processId: applicationData?.process.id as string,
      step: "REGISTRATION_DATA",
    },
    {
      enabled: !!applicationData?.process.id,
    }
  );

  const {
    mutateAsync: finalizeRegistrationDataApplication,
    isLoading: finalizingRegistrationDataApplication,
  } = api.registrationDataApplication.finalize.useMutation({
    onSuccess: () => {
      void ctx.application.getUserApplication.invalidate({
        applicationId: router.query.applicationId as string,
      });
    },
  });
  const {
    mutate: updateRegistrationDataApplication,
    isLoading: updatingRegistrationDataApplication,
  } = api.registrationDataApplication.update.useMutation({
    onSuccess: () => {
      toast.success("Dados da inscrição salvos com sucesso.");
      clearErrors();
      void ctx.application.getUserApplication.invalidate({
        applicationId: router.query.applicationId as string,
      });
    },
    onError: (error) => {
      handleTRPCError(error, "Erro ao salvar dados da inscrição.");
    },
  });

  useEffect(() => {
    if (applicationData) {
      setValue("applicationId", applicationData.id);
      if (applicationData?.registrationDataApplication) {
        applicationData.registrationDataApplication.vacancyType && setValue(
          "vacancyType",
          applicationData.registrationDataApplication.vacancyType
        );
        applicationData.registrationDataApplication.modality && setValue(
          "modality",
          applicationData.registrationDataApplication.modality
        );
        applicationData.registrationDataApplication.modalityType && setValue(
          "modalityType",
          applicationData.registrationDataApplication.modalityType
        );
        applicationData.registrationDataApplication.researchLineId && setValue(
          "researchLineId",
          applicationData.registrationDataApplication.researchLineId
        );
        applicationData.registrationDataApplication.scholarship && setValue(
          "scholarship",
          applicationData.registrationDataApplication.scholarship
        );
        applicationData.registrationDataApplication.specialStudent && setValue(
          "specialStudent",
          applicationData.registrationDataApplication.specialStudent
        );
        applicationData.registrationDataApplication.tutors && setValue(
          "tutors",
          applicationData.registrationDataApplication.tutors
        );
      }
    }
  }, [applicationData, setValue]);

  if (!router.query.applicationId) {
    return <div>404</div>;
  }

  if (isLoadingApplicationData || isLoadingRegistrationDataDocuments) {
    return <div>Carregando...</div>;
  }

  if (!applicationData || !registrationDataDocuments) {
    return <div>404</div>;
  }

  const userStepDocuments = filterProcessStepDocuments({
    documents: registrationDataDocuments,
    modality: modalityWatch,
    vacancyType: vacancyTypeWatch,
    step: "REGISTRATION_DATA",
  });

  const requiredDocuments = userStepDocuments?.filter(
    (processDocument) => processDocument.document.required
  );

  const handleClickSaveButton = async () => {
    await trigger();
    const formValues = getValues();

    const updateInput: UpdateRegistrationDataApplicationSchema = formValues;
    (Object.keys(updateInput) as (keyof typeof updateInput)[]).forEach(
      (key) => {
        if (!updateInput[key]) {
          delete updateInput[key];
        }
      }
    );

    updateRegistrationDataApplication(updateInput);
  };

  const onSubmit = async (data: FinalizeRegistrationDataApplicationSchema) => {
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
      await finalizeRegistrationDataApplication(data);
      await router.push(
        `/candidato/inscricao/${applicationData.id}/dados-academicos`
      );
    } catch (error) {
      handleTRPCError(error, "Erro ao registrar dados da inscrição");
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
          <ApplicationStepper currentStep={2} application={applicationData} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="mt-6 flex flex-col">
            <h3 className="text-lg font-medium">Dados inscrição</h3>
            <div className="grid grid-cols-3 gap-2">
              <Select
                name="vacancyType"
                label="Tipo de vaga"
                placeholder="Tipo de vaga"
                register={register}
                error={errors.vacancyType}
                required
                disabled={!isValidApplicationPeriod}
              >
                <option value="">Selecione</option>
                {Object.keys(VacancyType).map((type) => (
                  <option key={type} value={type}>
                    {vacancyTypeMapper[type as keyof typeof VacancyType]}
                  </option>
                ))}
              </Select>
              <Select
                name="modality"
                label="Modalidade de vaga"
                placeholder="Modalidade de vaga"
                register={register}
                error={errors.modality}
                required
                disabled={!isValidApplicationPeriod}
              >
                <option value="">Selecione</option>
                {Object.keys(Modality).map((modality) => (
                  <option key={modality} value={modality}>
                    {modalityMapper[modality as keyof typeof Modality]}
                  </option>
                ))}
              </Select>
              <Select
                name="modalityType"
                label="Aluno Regular ou especial?"
                register={register}
                error={errors.modalityType}
                required
                disabled={!isValidApplicationPeriod}
              >
                <option value="">Selecione</option>
                {Object.keys(ModalityType).map((modalityType) => (
                  <option key={modalityType} value={modalityType}>
                    {modalityTypeMapper[modalityType as keyof typeof ModalityType]}
                  </option>
                ))}
              </Select>
              <Select
                name="researchLineId"
                label="Linha de pesquisa"
                placeholder="Linha de pesquisa"
                register={register}
                error={errors.researchLineId}
                required
                disabled={!isValidApplicationPeriod}
              >
                <option value="">Selecione</option>
                {applicationData.process.ProcessResearchLine.map(
                  ({ researchLine }) => (
                    <option key={researchLine.id} value={researchLine.id}>
                      {researchLine.name}
                    </option>
                  )
                )}
              </Select>
            </div>
            {modalityTypeWatch === "REGULAR" && <><div className="mt-2 flex items-center gap-2">
              <input
                className="checkbox"
                type="checkbox"
                id="specialStudent"
                disabled={!isValidApplicationPeriod}
                {...register("specialStudent")}
              />
              <label htmlFor="specialStudent">
                Tenho interesse em concorrer como aluno especial caso não seja
                selecionado como aluno regular e obtenha pontuação suficiente
                para ingressar como aluno especial.
              </label>
            </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  className="checkbox"
                  type="checkbox"
                  id="scholarship"
                  disabled={!isValidApplicationPeriod}
                  {...register("scholarship")}
                />
                <label htmlFor="scholarship">
                  Tenho interesse em concorrer a bolsa de estudo.
                </label>
              </div>
            </>}

            {modalityTypeWatch === "SPECIAL" && researchLineWatch &&
              <>
                <TextArea
                  name="tutors"
                  label="Rankear tutores da linha de pesquisa selecionada"
                  placeholder="Indique ao menos um tutor e ranqueie sua escolha. Ex: 1- João, 2- Maria, 3- José"
                  register={register}
                  error={errors.tutors}
                  maxLength={255}
                  required
                />
                {isLoadingResearchLine ?
                  <div className="animate-pulse h-10 w-full bg-slate-300" />
                  :
                  <p className="font-medium">Lista de tutores: <span className="font-normal">{researchLine?.TutorResearchLine.map((tutor) => tutor.name).join(", ")}</span></p>
                }
                <p className="font-medium text-red-500">Obs: A indicação não necessariamente vai ser seguida pela ordem do candidato.</p>
              </>
            }
          </div>

          {isLoadingRegistrationDataDocuments && (
            <div className="mt-4 flex animate-pulse flex-col">
              <h3 className="h-6 w-48 rounded bg-slate-200 text-lg font-medium"></h3>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="h-[30px] w-full rounded bg-slate-200"></div>
                <div className="h-[30px] w-full rounded bg-slate-200"></div>
                <div className="h-[30px] w-full rounded bg-slate-200"></div>
              </div>
            </div>
          )}
          {(!modalityWatch || !vacancyTypeWatch) && (
            <div>
              <p className="font-medium">
                * Selecione o tipo e modalidade de vaga para carregar os
                documentos necessários
              </p>
            </div>
          )}
          {modalityWatch &&
            vacancyTypeWatch &&
            userStepDocuments &&
            userStepDocuments.length > 0 && (
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
                  `/candidato/inscricao/${applicationData.id}/dados-pessoais`
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
                  updatingRegistrationDataApplication && "loading"
                )}
                disabled={
                  !isValidApplicationPeriod ||
                  updatingRegistrationDataApplication
                }
                type="button"
                onClick={handleClickSaveButton}
              >
                Salvar dados
              </button>
              <button
                className={clsx(
                  "btn-primary btn",
                  finalizingRegistrationDataApplication && "loading"
                )}
                disabled={
                  !isValidApplicationPeriod ||
                  finalizingRegistrationDataApplication
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

export default RegistrationData;
