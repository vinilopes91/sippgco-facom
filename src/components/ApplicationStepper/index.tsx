import { type RouterOutputs } from "@/utils/api";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";

type ApplicationStepperProps = {
  currentStep: number;
  application: RouterOutputs["application"]["getUserApplication"];
};

const ApplicationStepper = (props: ApplicationStepperProps) => {
  const { currentStep, application } = props;

  const router = useRouter();

  return (
    <ul className="steps w-[40rem]">
      <li
        className={clsx(
          "step font-medium",
          currentStep === 1 && "step-primary",
          application.personalDataApplication?.stepCompleted && "step-success"
        )}
      >
        <Link
          className="font-medium text-slate-900 hover:underline"
          href={`/candidato/inscricao/${
            router.query.applicationId as string
          }/dados-pessoais`}
        >
          Dados pessoais
        </Link>
      </li>
      <li
        className={clsx(
          "step font-medium",
          currentStep === 2 && "step-primary",
          application.registrationDataApplication?.stepCompleted &&
            "step-success"
        )}
      >
        <Link
          className="font-medium text-slate-900 hover:underline"
          href={`/candidato/inscricao/${
            router.query.applicationId as string
          }/dados-inscricao`}
        >
          Dados da inscrição
        </Link>
      </li>
      <li
        className={clsx(
          "step font-medium",
          currentStep === 3 && "step-primary",
          application.academicDataApplication?.stepCompleted && "step-success"
        )}
      >
        <Link
          className="font-medium text-slate-900 hover:underline"
          href={`/candidato/inscricao/${
            router.query.applicationId as string
          }/dados-academicos`}
        >
          Dados acadêmicos
        </Link>
      </li>
      <li
        className={clsx(
          "step font-medium",
          currentStep === 4 && "step-primary",
          application.applicationFilled && "step-success"
        )}
      >
        <Link
          className="font-medium text-slate-900 hover:underline"
          href={`/candidato/inscricao/${
            router.query.applicationId as string
          }/curriculo`}
        >
          Currículo
        </Link>
      </li>
    </ul>
  );
};

export default ApplicationStepper;
