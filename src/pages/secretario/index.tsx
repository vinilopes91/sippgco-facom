import Base from "@/layout/Base";
import { api } from "@/utils/api";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { type NextPage } from "next";
import Link from "next/link";

const SecretarioHome: NextPage = () => {
  const { data } = api.process.list.useQuery();

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
                <div className="flex items-center space-x-3">
                  <Link className="font-medium" href={`/candidato/1`}>
                    {processData.name}
                  </Link>
                  <button className="text-red-500 hover:opacity-90 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50">
                    <TrashIcon width={20} />
                  </button>
                  <button className="text-blue-600 hover:opacity-90 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50">
                    <PencilSquareIcon width={20} />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
        <Link className="btn-primary btn mt-6" href="secretario/novo-processo">
          Adicionar novo processo
        </Link>
      </div>
    </Base>
  );
};

export default SecretarioHome;
