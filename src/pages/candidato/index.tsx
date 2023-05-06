import { type NextPage } from "next";
import { signOut } from "next-auth/react";

const CandidatoHome: NextPage = () => (
  <div>
    Candidato... <button onClick={() => signOut()}>Logout</button>
  </div>
);

export default CandidatoHome;
