import DeleteProcessModal from "@/components/Modals/DeleteProcess";
import ProcessStatusBadge from "@/components/ProcessStatusBadge";
import Base from "@/layout/Base";
import { api } from "@/utils/api";
import { TrashIcon } from "@heroicons/react/24/outline";
import { type Process } from "@prisma/client";
import { type NextPage } from "next";
import Link from "next/link";
import { useState } from "react";

const SecretarioHome: NextPage = () => {
  const [deleteProcessModal, setDeleteProcessModal] = useState(false);
  const [processSelected, setProcessSelected] = useState<Process>();

  const { data } = api.process.list.useQuery();

  const handleClickDeleteButton = (process: Process) => {
    setProcessSelected(process);
    setDeleteProcessModal(true);
  };

  return (
    <Base>
      <div className="rounded-lg bg-white p-6">
        <h2 className="text-2xl font-bold">Processos seletivos</h2>
        <ul className="mt-4 list-none">
          {data?.length === 0 ? (
            <p>Nenhum processo cadastrado</p>
          ) : (
            data?.map((processData) => (
              <li key={processData.id}>
                <div className="flex items-center gap-4">
                  <Link
                    className="font-medium"
                    href={`/secretario/processo/${processData.id}`}
                  >
                    {processData.name}
                  </Link>
                  <ProcessStatusBadge status={processData.status} />
                  <button
                    className="btn-ghost btn h-fit min-h-fit p-0 text-red-500"
                    onClick={() => handleClickDeleteButton(processData)}
                  >
                    <TrashIcon width={20} />
                  </button>
                  {/* <button className="btn-ghost btn h-fit min-h-fit p-0 text-blue-600">
                    <PencilSquareIcon width={20} />
                  </button> */}
                </div>
              </li>
            ))
          )}
        </ul>
        <Link className="btn-primary btn mt-6" href="secretario/novo-processo">
          Adicionar novo processo
        </Link>
      </div>

      <DeleteProcessModal
        onClose={() => setDeleteProcessModal(false)}
        open={deleteProcessModal}
        process={processSelected}
      />
    </Base>
  );
};

export default SecretarioHome;
