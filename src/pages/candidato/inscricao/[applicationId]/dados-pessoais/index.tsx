import { useEffect } from "react";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Base from "@/layout/Base";
import ApplicationStepper from "@/components/ApplicationStepper";
import { useForm } from "react-hook-form";
import {
  type CreatePersonalDataApplication,
  createPersonalDataApplication,
} from "@/common/validation/personalDataApplication";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Input from "@/components/Input";
import StepFileInput from "@/components/StepFileInput/StepFileInput";
import { toast } from "react-hot-toast";
import { NumberFormatBase } from "react-number-format";
import { maskPhoneNumber } from "@/utils/mask";

const PersonalData: NextPage = () => {
  const router = useRouter();
  const { data: userSession, status: sessionStatus } = useSession();

  const { register, handleSubmit, formState, setValue } =
    useForm<CreatePersonalDataApplication>({
      resolver: zodResolver(createPersonalDataApplication),
    });

  useEffect(() => {
    if (userSession && userSession.user.name && userSession.user.email) {
      setValue("name", userSession.user.name);
      setValue("email", userSession.user.email);
    }
  }, [setValue, userSession]);

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

  const {
    data: personalDataDocuments,
    isLoading: isLoadingPersonalDataDocuments,
  } = api.processDocuments.listProcessDocuments.useQuery(
    {
      processId: applicationData?.process.id as string,
      step: "PERSONAL_DATA",
    },
    {
      enabled: !!applicationData?.process.id,
    }
  );

  // TODO Criar mutation para enviar os dados pessoais

  if (!router.query.applicationId) {
    return <div>404</div>;
  }

  if (
    isLoadingApplicationData ||
    sessionStatus === "loading" ||
    !personalDataDocuments
  ) {
    return <div>Loading...</div>;
  }

  if (!applicationData) {
    return <div>Inscrição não encontrada.</div>;
  }

  const requiredDocuments = personalDataDocuments?.filter(
    (processDocument) => processDocument.document.required
  );

  const onSubmit = (data: CreatePersonalDataApplication) => {
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

    console.log("Submit..", data);

    // return mutate(data);
  };

  return (
    <Base pageTitle="Minhas candidaturas" backBtn>
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
              <Input
                label="Nome completo"
                name="name"
                register={register}
                error={errors.name}
                disabled
              />
              <Input
                label="E-mail"
                name="email"
                register={register}
                error={errors.email}
                disabled
              />
              <NumberFormatBase
                format={maskPhoneNumber}
                id="phone"
                name="phone"
                minLength={14}
                maxLength={16}
                label="Telefone"
                error={errors.phone}
                register={register}
                customInput={Input<CreatePersonalDataApplication>}
                onValueChange={(values) => {
                  setValue("phone", values.value);
                }}
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
                {personalDataDocuments.map(({ document, documentId }) => {
                  return (
                    <StepFileInput
                      key={documentId}
                      applicationData={applicationData}
                      document={document}
                      documentId={documentId}
                    />
                  );
                })}
              </div>
            </div>
          )}
          <button className="btn-primary btn" type="submit">
            Avançar
          </button>
        </form>
      </div>
    </Base>
  );
};

export default PersonalData;
