import { type NextPage } from "next";
import Base from "@/layout/Base";
import Link from "next/link";
import { api } from "@/utils/api";

const CandidatoHome: NextPage = () => {
  const { data } = api.process.list.useQuery();

  console.log(data);

  return (
    <Base>
      <div className="grid gap-9 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-6">
          <h2 className="text-2xl font-bold">Minhas candidaturas</h2>
          <ul className="mt-4 list-none">
            <li>
              <Link className="font-medium" href={`/candidato/1`}>
                PPGCO N 2/2022
              </Link>
            </li>
            <li>
              <Link className="font-medium" href={`/candidato/1`}>
                PPGCO N 1/2022
              </Link>
            </li>
          </ul>
        </div>
        <div className="rounded-lg bg-white p-6">
          <h2 className="text-2xl font-bold">Processos seletivos ativos</h2>
          <ul className="mt-4">
            <li>
              <Link className="font-medium" href={`/candidato/1`}>
                PPGCO N 1/2023
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </Base>
  );
};

export default CandidatoHome;
