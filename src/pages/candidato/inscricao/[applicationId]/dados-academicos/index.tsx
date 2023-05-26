import { type NextPage } from "next";
import { useRouter } from "next/router";

import { api } from "@/utils/api";
import Base from "@/layout/Base";
import ApplicationStepper from "@/components/ApplicationStepper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type CreateAcademicDataApplication,
  createAcademicDataApplication,
} from "@/common/validation/academicDataApplication";
import Input from "@/components/Input";
import FileInput from "@/components/FileInput";

const AcademicData: NextPage = () => {
  const router = useRouter();

  const { register, handleSubmit, formState } =
    useForm<CreateAcademicDataApplication>({
      resolver: zodResolver(createAcademicDataApplication),
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

  if (!router.query.applicationId) {
    return <div>404</div>;
  }

  if (isLoadingApplicationData) {
    return <div>Loading...</div>;
  }

  if (!applicationData) {
    return <div>404</div>;
  }

  const onSubmit = (data: CreateAcademicDataApplication) => {
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
          <ApplicationStepper currentStep={3} />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="mt-6 flex flex-col">
            <h3 className="text-lg font-medium">Dados acadêmicos</h3>
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Curso/Área"
                name="courseArea"
                register={register}
                error={errors.courseArea}
              />
              <Input
                label="Ano ou previsão de conclusão"
                name="completionOrForecastYear"
                register={register}
                error={errors.completionOrForecastYear}
              />
              <Input
                label="Instituição"
                name="institution"
                register={register}
                error={errors.institution}
              />
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

export default AcademicData;
