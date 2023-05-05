import { signOut } from "next-auth/react";

const CandidatoHome = () => (
  <div>
    Candidato... <button onClick={() => signOut()}>Logout</button>
  </div>
);

export default CandidatoHome;
