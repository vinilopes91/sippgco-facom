import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { api } from "@/utils/api";
import Base from "@/layout/Base";

const Inscricao: NextPage = () => {
  const router = useRouter();
  const { data: userSession } = useSession();
  const ctx = api.useContext();

  const { data: applicationData, isLoading: isLoadingApplicationData } =
    api.application.get.useQuery(
      {
        applicationId: router.query.applicationId as string,
        userId: userSession?.user.id as string,
      },
      {
        enabled: !!router.query.applicationId && !!userSession?.user.id,
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
  console.log("🚀 ~ file: index.tsx:33 ~ applicationData:", applicationData);

  return (
    <Base pageTitle="Minhas candidaturas" backBtn>
      <div className="mt-6 rounded-lg bg-white p-6 drop-shadow-sm">
        <h2 className="text-2xl font-bold">{applicationData.process.name}</h2>
      </div>
    </Base>
  );
};

export default Inscricao;
