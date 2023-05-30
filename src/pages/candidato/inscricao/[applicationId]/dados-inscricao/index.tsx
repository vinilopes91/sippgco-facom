import { type NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Base from "@/layout/Base";
import ApplicationStepper from "@/components/ApplicationStepper";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createRegistrationDataApplicationSchema,
  type CreateRegistrationDataApplicationSchema,
} from "@/common/validation/registrationDataApplication";
import { useForm } from "react-hook-form";
import Select from "@/components/Select";
import { Modality, VacancyType } from "@prisma/client";
import { modalityMapper, vacancyTypeMapper } from "@/utils/mapper";
import StepFileInput from "@/components/StepFileInput/StepFileInput";
import { useEffect } from "react";
import { handleTRPCError } from "@/utils/errors";
import { toast } from "react-hot-toast";
import clsx from "clsx";
import { filterProcessStepDocuments } from "@/utils/filterDocuments";

const RegistrationData: NextPage = () => {
  const router = useRouter();
  const ctx = api.useContext();

  const { register, handleSubmit, formState, setValue, watch } =
    useForm<CreateRegistrationDataApplicationSchema>({
      resolver: zodResolver(createRegistrationDataApplicationSchema),
    });

  const { errors } = formState;

  const [modalityWatch, vacancyTypeWatch] = watch(["modality", "vacancyType"]);

  const { data: applicationData, isLoading: isLoadingApplicationData } =
    api.application.getUserApplication.useQuery(
      {
        applicationId: router.query.applicationId as string,
      },
      {
        enabled: !!router.query.applicationId,
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
    mutateAsync: createRegistrationDataApplication,
    isLoading: creatingRegistrationDataApplication,
  } = api.registrationDataApplication.create.useMutation();
  const {
    mutate: updateRegistrationDataApplication,
    isLoading: updatingRegistrationDataApplication,
  } = api.registrationDataApplication.update.useMutation({
    onSuccess: () => {
      toast.success("Dados da inscrição salvos com sucesso.");
    },
    onError: (error) => {
      handleTRPCError(error, "Erro ao salvar dados da inscrição.");
    },
  });

  useEffect(() => {
    if (applicationData) {
      setValue("applicationId", applicationData.id);
      if (applicationData?.registrationDataApplication) {
        setValue(
          "vacancyType",
          applicationData.registrationDataApplication.vacancyType
        );
        setValue(
          "modality",
          applicationData.registrationDataApplication.modality
        );
        setValue(
          "researchLineId",
          applicationData.registrationDataApplication.researchLineId
        );
        setValue(
          "scholarship",
          applicationData.registrationDataApplication.scholarship
        );
        setValue(
          "specialStudent",
          applicationData.registrationDataApplication.specialStudent
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

  const registrationDataApplicationId =
    applicationData.registrationDataApplication?.id;

  const userStepDocuments = filterProcessStepDocuments({
    documents: registrationDataDocuments,
    modality: modalityWatch,
    vacancyType: vacancyTypeWatch,
    step: "REGISTRATION_DATA",
  });

  const requiredDocuments = userStepDocuments?.filter(
    (processDocument) => processDocument.document.required
  );

  const onSubmit = async (data: CreateRegistrationDataApplicationSchema) => {
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

    if (registrationDataApplicationId) {
      updateRegistrationDataApplication({
        id: registrationDataApplicationId,
        ...data,
      });
    } else {
      try {
        await createRegistrationDataApplication(data);
        await router.push(
          `/candidato/inscricao/${applicationData.id}/dados-academicos`
        );
      } catch (error) {
        handleTRPCError(error, "Erro ao registrar dados da inscrição");
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
          <ApplicationStepper currentStep={2} />
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
              >
                <option value="">Selecione</option>
                {Object.keys(Modality).map((modality) => (
                  <option key={modality} value={modality}>
                    {modalityMapper[modality as keyof typeof Modality]}
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
            <div className="mt-2 flex items-center gap-2">
              <input
                className="checkbox"
                type="checkbox"
                id="specialStudent"
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
                {...register("scholarship")}
              />
              <label htmlFor="scholarship">
                Tenho interesse em concorrer a bolsa de estudo.
              </label>
            </div>
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
          <div className="flex items-center justify-end">
            {registrationDataApplicationId ? (
              <button
                className={clsx(
                  "btn-primary btn w-36",
                  updatingRegistrationDataApplication && "loading"
                )}
                disabled={updatingRegistrationDataApplication}
                type="submit"
              >
                Salvar
              </button>
            ) : (
              <button
                className={clsx(
                  "btn-primary btn w-36",
                  creatingRegistrationDataApplication && "loading"
                )}
                disabled={creatingRegistrationDataApplication}
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

export default RegistrationData;
