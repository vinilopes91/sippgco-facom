import { type NextPage } from "next";
import Base from "@/layout/Base";
import Link from "next/link";
import { type RouterOutputs, api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import DeleteApplicationModal from "@/components/Modals/DeleteApplication";

type ApplicationResponse =
  RouterOutputs["application"]["listUserApplications"][number];

const CandidatoHome: NextPage = () => {
  const [openDeleteApplicationModal, setOpenDeleteApplicationModal] =
    useState(false);
  const [applicationSelected, setApplicationSelected] =
    useState<ApplicationResponse>();

  const handleClickDeleteButton = (application: ApplicationResponse) => {
    setApplicationSelected(application);
    setOpenDeleteApplicationModal(true);
  };

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
      <DeleteApplicationModal
        onClose={() => setOpenDeleteApplicationModal(false)}
        open={openDeleteApplicationModal}
        application={applicationSelected}
      />
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
                <div className="flex items-center gap-2">
                  <Link
                    className="font-medium"
                    href={`/candidato/inscricao/${application.id}`}
                  >
                    {application.process.name}
                  </Link>
                  <button
                    className="btn-ghost btn h-fit min-h-fit p-0 text-red-500"
                    onClick={() => handleClickDeleteButton(application)}
                  >
                    <TrashIcon width={20} />
                  </button>
                </div>
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
