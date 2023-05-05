import { signOut } from "next-auth/react";

const SecretarioHome = () => (
  <div>
    Secretário... <button onClick={() => signOut()}>Logout</button>
  </div>
);

export default SecretarioHome;
