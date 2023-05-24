import { type NextPage } from "next";
import { useRouter } from "next/router";

import { api } from "@/utils/api";
import Base from "@/layout/Base";
import ApplicationStepper from "@/components/ApplicationStepper";
import FileInput from "@/components/FileInput";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createRegistrationDataApplication,
  type CreateRegistrationDataApplication,
} from "@/common/validation/registrationDataApplication";
import { useForm } from "react-hook-form";
import Select from "@/components/Select";
import { Modality, VacancyType } from "@prisma/client";
import { modalityMapper, vacancyTypeMapper } from "@/utils/mapper";

const RegistrationData: NextPage = () => {
  const router = useRouter();

  const { register, handleSubmit, formState } =
    useForm<CreateRegistrationDataApplication>({
      resolver: zodResolver(createRegistrationDataApplication),
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

  console.log(applicationData);

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

  if (!router.query.applicationId) {
    return <div>404</div>;
  }

  if (isLoadingApplicationData) {
    return <div>Loading...</div>;
  }

  if (!applicationData) {
    return <div>404</div>;
  }

  const onSubmit = (data: CreateRegistrationDataApplication) => {
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
                <option selected value="">
                  Selecione
                </option>
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
                <option selected value="">
                  Selecione
                </option>
                {Object.keys(Modality).map((modality) => (
                  <option key={modality} value={modality}>
                    {modalityMapper[modality as keyof typeof Modality]}
                  </option>
                ))}
              </Select>
              <Select
                name="researchLine"
                label="Linha de pesquisa"
                placeholder="Linha de pesquisa"
                register={register}
                error={errors.researchLine}
                required
              >
                <option selected value="">
                  Selecione
                </option>
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
          {registrationDataDocuments &&
            registrationDataDocuments.length > 0 && (
              <div className="mt-4 flex flex-col">
                <h3 className="text-lg font-medium">Documentos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {registrationDataDocuments.map(({ document, documentId }) => (
                    <FileInput key={documentId} label={document.name} />
                  ))}
                </div>
              </div>
            )}
        </form>
      </div>
    </Base>
  );
};

export default RegistrationData;
