import { useEffect } from "react";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Base from "@/layout/Base";
import ApplicationStepper from "@/components/ApplicationStepper";
import { useForm, Controller } from "react-hook-form";
import {
  type CreatePersonalDataApplicationSchema,
  createPersonalDataApplicationSchema,
} from "@/common/validation/personalDataApplication";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import StepFileInput from "@/components/StepFileInput/StepFileInput";
import { toast } from "react-hot-toast";
import { NumberFormatBase } from "react-number-format";
import { maskPhoneNumber } from "@/utils/mask";
import clsx from "clsx";
import { handleTRPCError } from "@/utils/errors";
import ControlledInput from "@/components/ControlledInput";
import { isValidPeriod } from "@/utils/application";

const PersonalData: NextPage = () => {
  const router = useRouter();
  const { data: userSession, status: sessionStatus } = useSession();
  const ctx = api.useContext();

  const { handleSubmit, formState, setValue, control } =
    useForm<CreatePersonalDataApplicationSchema>({
      resolver: zodResolver(createPersonalDataApplicationSchema),
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
    if (applicationData?.personalDataApplication) {
      setValue("phone", applicationData.personalDataApplication.phone);
    }
  }, [applicationData, setValue]);

  const {
    data: personalDataDocuments,
    isLoading: isLoadingPersonalDataDocuments,
  } = api.processDocuments.listProcessDocuments.useQuery(
    {
      processId: applicationData?.processId as string,
      step: "PERSONAL_DATA",
    },
    {
      enabled: !!applicationData?.processId,
    }
  );

  const {
    mutateAsync: createPersonalDataApplication,
    isLoading: creatingPersonalDataApplication,
  } = api.personalDataApplication.create.useMutation();
  const {
    mutate: updatePersonalDataApplication,
    isLoading: updatingPersonalDataApplication,
  } = api.personalDataApplication.update.useMutation({
    onSuccess: () => {
      toast.success("Dados pessoais salvos com sucesso.");
    },
    onError: (error) => {
      handleTRPCError(error, "Erro ao salvar dados pessoais.");
    },
  });

  if (!router.query.applicationId) {
    return <div>404</div>;
  }

  if (
    isLoadingApplicationData ||
    sessionStatus === "loading" ||
    isLoadingPersonalDataDocuments
  ) {
    return <div>Carregando...</div>;
  }

  if (!applicationData || !personalDataDocuments) {
    return <div>404</div>;
  }

  const personalDataApplicationId = applicationData.personalDataApplication?.id;

  const requiredDocuments = personalDataDocuments?.filter(
    (processDocument) => processDocument.document.required
  );

  const onSubmit = async (data: CreatePersonalDataApplicationSchema) => {
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

    if (personalDataApplicationId) {
      updatePersonalDataApplication({
        id: personalDataApplicationId,
        ...data,
      });
    } else {
      try {
        await createPersonalDataApplication(data);
        await router.push(
          `/candidato/inscricao/${applicationData.id}/dados-inscricao`
        );
      } catch (error) {
        handleTRPCError(error, "Erro ao registrar dados pessoais");
      }
    }
    void ctx.application.getUserApplication.invalidate({
      applicationId: router.query.applicationId as string,
    });
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
          <ApplicationStepper currentStep={1} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="mt-6 flex flex-col">
            <h3 className="text-lg font-medium">Dados pessoais</h3>
            <div className="grid grid-cols-3 gap-2">
              <ControlledInput
                label="Nome completo"
                name="name"
                disabled
                value={userSession?.user.name as string}
              />
              <ControlledInput
                label="E-mail"
                name="email"
                disabled
                value={userSession?.user.email as string}
              />
              <Controller
                control={control}
                name="phone"
                render={({ field: { name, value } }) => (
                  <NumberFormatBase
                    name={name}
                    value={value}
                    id="phone"
                    format={maskPhoneNumber}
                    minLength={14}
                    maxLength={16}
                    label="Telefone"
                    placeholder="(99) 9 9999-9999"
                    required
                    valueIsNumericString
                    errorMessage={errors.phone?.message}
                    customInput={ControlledInput}
                    disabled={
                      !isValidApplicationPeriod || isLoadingApplicationData
                    }
                    onValueChange={(values) => {
                      setValue("phone", values.value);
                    }}
                  />
                )}
              />
            </div>
          </div>

          {isLoadingPersonalDataDocuments && (
            <div className="mt-4 flex animate-pulse flex-col">
              <h3 className="h-6 w-48 rounded bg-slate-200 text-lg font-medium"></h3>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="h-[30px] w-full rounded bg-slate-200"></div>
                <div className="h-[30px] w-full rounded bg-slate-200"></div>
                <div className="h-[30px] w-full rounded bg-slate-200"></div>
              </div>
            </div>
          )}
          {personalDataDocuments && personalDataDocuments.length > 0 && (
            <div className="mt-4 flex flex-col">
              <h3 className="text-lg font-medium">Documentos</h3>
              <div className="grid grid-cols-3 gap-2">
                {personalDataDocuments.map(({ document, documentId }) => (
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
            {personalDataApplicationId ? (
              <button
                className={clsx(
                  "btn-primary btn w-36",
                  updatingPersonalDataApplication && "loading"
                )}
                disabled={
                  !isValidApplicationPeriod || updatingPersonalDataApplication
                }
                type="submit"
              >
                Salvar
              </button>
            ) : (
              <button
                className={clsx(
                  "btn-primary btn w-36",
                  creatingPersonalDataApplication && "loading"
                )}
                disabled={
                  !isValidApplicationPeriod || creatingPersonalDataApplication
                }
                type="submit"
              >
                Avançar
              </button>
            )}
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

export default PersonalData;
