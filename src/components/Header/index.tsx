import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

import LogoFacom from "public/images/logo-facom.png";

const Header = (props: React.ComponentPropsWithoutRef<"header">) => {
  const { data: session } = useSession();

  const name = session?.user.name as string;

  return (
    <header
      className="flex h-14 w-full items-center justify-between border-b border-gray-200 bg-primary-400 px-6 py-2.5"
      {...props}
    >
      <Image className="hi w-32 rounded-sm" alt="Logo FACOM" src={LogoFacom} />
      <div className="flex items-center justify-between text-white">
        <span className="hidden sm:block">{`Olá ${name}!`}</span>
        <button onClick={() => signOut()} className="ml-2 sm:ml-10">
          <ArrowLeftOnRectangleIcon width={24} stroke="#fff" />
        </button>
      </div>
    </header>
  );
};

export default Header;
