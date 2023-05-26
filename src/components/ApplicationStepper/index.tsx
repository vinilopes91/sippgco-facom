import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";

type ApplicationStepperProps = {
  currentStep: number;
};

const ApplicationStepper = (props: ApplicationStepperProps) => {
  const { currentStep } = props;

  const router = useRouter();

  return (
    <ul className="steps w-[40rem]">
      <li
        className={clsx(
          "step font-medium",
          currentStep === 1 && "step-primary"
        )}
      >
        <Link
          className="font-medium text-slate-900 no-underline hover:underline"
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
          currentStep === 2 && "step-primary"
        )}
      >
        <Link
          className="font-medium text-slate-900 no-underline hover:underline"
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
          currentStep === 3 && "step-primary"
        )}
      >
        <Link
          className="font-medium text-slate-900 no-underline hover:underline"
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
          currentStep === 4 && "step-primary"
        )}
      >
        <Link
          className="font-medium text-slate-900 no-underline hover:underline"
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
