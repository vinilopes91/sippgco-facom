import { useEffect } from "react";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Base from "@/layout/Base";
import ApplicationStepper from "@/components/ApplicationStepper";
import { useForm, Controller } from "react-hook-form";
import {
  type FinalizePersonalDataApplicationSchema,
  finalizePersonalDataApplicationSchema,
  type UpdatePersonalDataApplicationSchema,
} from "@/common/validation/personalDataApplication";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import StepFileInput from "@/components/StepFileInput/StepFileInput";
import { toast } from "react-hot-toast";
import { NumberFormatBase, PatternFormat } from "react-number-format";
import { maskPhoneNumber } from "@/utils/mask";
import clsx from "clsx";
import { handleTRPCError } from "@/utils/errors";
import ControlledInput from "@/components/ControlledInput";
import { isValidPeriod } from "@/utils/application";
import Input from "@/components/Input";
import { format } from "date-fns";
import { cpf as cpfValidator } from "cpf-cnpj-validator";

const PersonalData: NextPage = () => {
  const router = useRouter();
  const { data: userSession, status: sessionStatus } = useSession();
  const ctx = api.useContext();

  const {
    handleSubmit,
    formState,
    setValue,
    control,
    getValues,
    trigger,
    register,
    clearErrors,
  } = useForm<FinalizePersonalDataApplicationSchema>({
    resolver: zodResolver(finalizePersonalDataApplicationSchema),
    mode: "onChange",
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
      applicationData.personalDataApplication.phone &&
        setValue("phone", applicationData.personalDataApplication.phone);
      applicationData.personalDataApplication.birthDate &&
        setValue(
          "birthDate",
          format(
            applicationData.personalDataApplication.birthDate,
            "yyyy-MM-dd"
          )
        );
      applicationData.personalDataApplication.cep &&
        setValue("cep", applicationData.personalDataApplication.cep);
      applicationData.personalDataApplication.city &&
        setValue("city", applicationData.personalDataApplication.city);
      applicationData.personalDataApplication.complement &&
        setValue(
          "complement",
          applicationData.personalDataApplication.complement
        );
      applicationData.personalDataApplication.cpf &&
        setValue("cpf", applicationData.personalDataApplication.cpf);
      applicationData.personalDataApplication.isWhatsApp &&
        setValue(
          "isWhatsApp",
          applicationData.personalDataApplication.isWhatsApp
        );
      applicationData.personalDataApplication.mobilePhone &&
        setValue(
          "mobilePhone",
          applicationData.personalDataApplication.mobilePhone
        );
      applicationData.personalDataApplication.nationality &&
        setValue(
          "nationality",
          applicationData.personalDataApplication.nationality
        );
      applicationData.personalDataApplication.neighborhood &&
        setValue(
          "neighborhood",
          applicationData.personalDataApplication.neighborhood
        );
      applicationData.personalDataApplication.number &&
        setValue("number", applicationData.personalDataApplication.number);
      applicationData.personalDataApplication.phone &&
        setValue("phone", applicationData.personalDataApplication.phone);
      applicationData.personalDataApplication.rgNumber &&
        setValue("rgNumber", applicationData.personalDataApplication.rgNumber);
      applicationData.personalDataApplication.rgOrg &&
        setValue("rgOrg", applicationData.personalDataApplication.rgOrg);
      applicationData.personalDataApplication.rgState &&
        setValue("rgState", applicationData.personalDataApplication.rgState);
      applicationData.personalDataApplication.state &&
        setValue("state", applicationData.personalDataApplication.state);
      applicationData.personalDataApplication.street &&
        setValue("street", applicationData.personalDataApplication.street);
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
    mutateAsync: finalizePersonalDataApplication,
    isLoading: finalizingPersonalDataApplication,
  } = api.personalDataApplication.finalize.useMutation({
    onSuccess: () => {
      void ctx.application.getUserApplication.invalidate({
        applicationId: router.query.applicationId as string,
      });
    },
  });
  const {
    mutate: updatePersonalDataApplication,
    isLoading: updatingPersonalDataApplication,
  } = api.personalDataApplication.update.useMutation({
    onSuccess: () => {
      toast.success("Dados pessoais salvos com sucesso.");
      clearErrors();
      void ctx.application.getUserApplication.invalidate({
        applicationId: router.query.applicationId as string,
      });
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

  const requiredDocuments = personalDataDocuments?.filter(
    (processDocument) => processDocument.document.required
  );

  const handleClickSaveButton = async () => {
    await trigger();
    const formValues = getValues();
    if (formValues.cpf && !cpfValidator.isValid(formValues.cpf)) {
      toast.error("CPF inválido");
      return;
    }
    const updateInput: UpdatePersonalDataApplicationSchema = formValues;
    (Object.keys(updateInput) as (keyof typeof updateInput)[]).forEach(
      (key) => {
        if (!updateInput[key]) {
          delete updateInput[key];
        }
      }
    );

    updatePersonalDataApplication(updateInput);
  };

  const onSubmit = async (data: FinalizePersonalDataApplicationSchema) => {
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
      await finalizePersonalDataApplication(data);
      await router.push(
        `/candidato/inscricao/${applicationData.id}/dados-inscricao`
      );
    } catch (error) {
      handleTRPCError(error, "Erro ao registrar dados pessoais");
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
          <ApplicationStepper currentStep={1} application={applicationData} />
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
                    maxLength={14}
                    label="Telefone Fixo"
                    placeholder="(99) 9999-9999"
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
              <div className="flex flex-col gap-2">
                <Controller
                  control={control}
                  name="mobilePhone"
                  render={({ field: { name, value } }) => (
                    <NumberFormatBase
                      name={name}
                      value={value}
                      id="mobilePhone"
                      format={maskPhoneNumber}
                      minLength={16}
                      maxLength={16}
                      label="Celular"
                      placeholder="(99) 9 9999-9999"
                      required
                      valueIsNumericString
                      errorMessage={errors.mobilePhone?.message}
                      customInput={ControlledInput}
                      disabled={
                        !isValidApplicationPeriod || isLoadingApplicationData
                      }
                      onValueChange={(values) => {
                        setValue("mobilePhone", values.value);
                      }}
                    />
                  )}
                />
                <div className="flex items-center gap-2">
                  <input
                    className="checkbox"
                    type="checkbox"
                    id="isWhatsApp"
                    disabled={
                      !isValidApplicationPeriod || isLoadingApplicationData
                    }
                    {...register("isWhatsApp")}
                  />
                  <label htmlFor="isWhatsApp">Celular é WhatsApp?</label>
                </div>
              </div>
              <Input
                label="Nacionalidade"
                placeholder="Nacionalidade"
                name="nationality"
                register={register}
                error={errors.nationality}
                disabled={!isValidApplicationPeriod || isLoadingApplicationData}
                required
              />
              <Input
                label="Data de nascimento"
                placeholder="Data de nascimento"
                name="birthDate"
                type="date"
                register={register}
                error={errors.birthDate}
                registerOptions={{
                  setValueAs: (value: string) =>
                    value && new Date(value).toISOString(),
                }}
                disabled={!isValidApplicationPeriod || isLoadingApplicationData}
                required
              />
              <Controller
                control={control}
                name="cpf"
                render={({ field: { name, value } }) => (
                  <PatternFormat
                    name={name}
                    value={value}
                    id="cpf"
                    format="###.###.###-##"
                    label="CPF"
                    placeholder="___.___.___-__"
                    required
                    minLength={14}
                    valueIsNumericString
                    errorMessage={errors.cpf?.message}
                    customInput={ControlledInput}
                    disabled={
                      !isValidApplicationPeriod || isLoadingApplicationData
                    }
                    onValueChange={(values) => {
                      setValue("cpf", values.value);
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="rgNumber"
                render={({ field: { name, value } }) => (
                  <NumberFormatBase
                    name={name}
                    value={value}
                    id="rgNumber"
                    label="Número do RG"
                    placeholder="Número do RG"
                    required
                    valueIsNumericString
                    errorMessage={errors.rgNumber?.message}
                    customInput={ControlledInput}
                    disabled={
                      !isValidApplicationPeriod || isLoadingApplicationData
                    }
                    onValueChange={(values) => {
                      setValue("rgNumber", values.value);
                    }}
                  />
                )}
              />
              <Input
                label="Orgão emissor do RG"
                placeholder="Orgão emissor do RG"
                name="rgOrg"
                register={register}
                error={errors.rgOrg}
                disabled={!isValidApplicationPeriod || isLoadingApplicationData}
                required
              />
              <Input
                label="Estado emissor do RG"
                placeholder="Estado emissor do RG"
                name="rgState"
                minLength={2}
                maxLength={2}
                register={register}
                error={errors.rgState}
                disabled={!isValidApplicationPeriod || isLoadingApplicationData}
                required
              />
            </div>
            <h3 className="text-lg font-medium mt-4">Endereço</h3>
            <div className="grid grid-cols-3 gap-2">
              <Controller
                control={control}
                name="cep"
                render={({ field: { name, value } }) => (
                  <PatternFormat
                    name={name}
                    value={value}
                    id="cep"
                    format="#####-###"
                    label="CEP"
                    placeholder="___-__"
                    required
                    valueIsNumericString
                    errorMessage={errors.cep?.message}
                    customInput={ControlledInput}
                    disabled={
                      !isValidApplicationPeriod || isLoadingApplicationData
                    }
                    onValueChange={(values) => {
                      setValue("cep", values.value);
                    }}
                  />
                )}
              />
              <Input
                label="Cidade"
                placeholder="Cidade"
                name="city"
                register={register}
                error={errors.city}
                disabled={!isValidApplicationPeriod || isLoadingApplicationData}
                required
              />
              <Input
                label="Estado"
                placeholder="Estado"
                name="state"
                minLength={2}
                maxLength={2}
                register={register}
                error={errors.state}
                disabled={!isValidApplicationPeriod || isLoadingApplicationData}
                required
              />
              <Input
                label="Logradouro"
                placeholder="Logradouro"
                name="street"
                register={register}
                error={errors.street}
                disabled={!isValidApplicationPeriod || isLoadingApplicationData}
                required
              />
              <Input
                label="Número"
                placeholder="Número"
                name="number"
                register={register}
                error={errors.number}
                disabled={!isValidApplicationPeriod || isLoadingApplicationData}
                required
              />
              <Input
                label="Complemento"
                placeholder="Complemento"
                name="complement"
                register={register}
                error={errors.complement}
                disabled={!isValidApplicationPeriod || isLoadingApplicationData}
              />
              <Input
                label="Bairro"
                placeholder="Bairro"
                name="neighborhood"
                register={register}
                error={errors.neighborhood}
                disabled={!isValidApplicationPeriod || isLoadingApplicationData}
                required
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
          <div className="mt-5 flex items-center justify-between gap-2">
            <button className="btn-primary btn w-36" disabled type="button">
              Voltar
            </button>
            <div className="flex items-center gap-2">
              <button
                className={clsx(
                  "btn-primary btn",
                  updatingPersonalDataApplication && "loading"
                )}
                disabled={
                  !isValidApplicationPeriod || updatingPersonalDataApplication
                }
                type="button"
                onClick={handleClickSaveButton}
              >
                Salvar Dados
              </button>
              <button
                className={clsx(
                  "btn-primary btn",
                  finalizingPersonalDataApplication && "loading"
                )}
                disabled={
                  !isValidApplicationPeriod || finalizingPersonalDataApplication
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

export default PersonalData;
