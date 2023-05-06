import { type NextPage } from "next";
import { signOut } from "next-auth/react";

const SecretarioHome: NextPage = () => (
  <div>
    Secretário... <button onClick={() => signOut()}>Logout</button>
  </div>
);

export default SecretarioHome;
