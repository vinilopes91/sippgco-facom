import { type NextPage } from "next";
import Base from "@/layout/Base";
import Link from "next/link";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";

const CandidatoHome: NextPage = () => {
  const { data: activeProcesses, isLoading: isLoadingActiveProcesses } =
    api.process.list.useQuery({
      status: "ACTIVE",
    });

  const { data: userSession } = useSession();

  const { data: userApplications, isLoading: isLoadingUserApplications } =
    api.application.listUserApplications.useQuery(undefined, {
      enabled: !!userSession?.user.id,
    });

  return (
    <Base>
      <div className="grid gap-9 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-6 drop-shadow-md">
          <h2 className="text-2xl font-bold">Minhas candidaturas</h2>
          <ul className="mt-4 list-none">
            {isLoadingUserApplications && (
              <div className="animate-pulse space-y-1">
                <li className="h-8 w-64 rounded bg-slate-300" />
                <li className="h-8 w-64 rounded bg-slate-300" />
              </div>
            )}
            {userApplications?.length === 0 && (
              <li>Você ainda não se candidatou a nenhum processo seletivo.</li>
            )}
            {userApplications?.map((application) => (
              <li key={application.id}>
                <Link
                  className="font-medium"
                  href={`/candidato/inscricao/${application.id}`}
                >
                  {application.process.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-white p-6 drop-shadow-md">
          <h2 className="text-2xl font-bold">Processos seletivos ativos</h2>
          <ul className="mt-4 space-y-1">
            {isLoadingActiveProcesses && (
              <div className="animate-pulse space-y-1">
                <li className="h-8 w-64 rounded bg-slate-300" />
                <li className="h-8 w-64 rounded bg-slate-300" />
              </div>
            )}
            {activeProcesses?.length === 0 && <li>Nenhum processo ativo</li>}
            {activeProcesses?.map((process) => (
              <li key={process.id}>
                <Link className="font-medium" href={`/candidato/${process.id}`}>
                  {process.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Base>
  );
};

export default CandidatoHome;
