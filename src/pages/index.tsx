import { type NextPage } from "next";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import LogoFacom from "public/images/logo-facom.png";

import { useForm } from "react-hook-form";
import { type LoginSchema, signInSchema } from "@/common/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

const Home: NextPage = () => {
  const { register, handleSubmit } = useForm<LoginSchema>({
    resolver: zodResolver(signInSchema),
  });

  const session = useSession();
  const router = useRouter();

  if (session.data?.user.role === "APPLICANT") {
    void router.push("/candidato");
  } else if (session.data?.user.role === "ADMIN") {
    void router.push("/candidato");
  }

  const onSubmit = async (data: LoginSchema) => {
    const response = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    if (response?.status === 401) {
      toast.error("Credenciais inválidas");
    } else if (!response?.ok) {
      toast.error("Não foi possível realizar o login");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full max-w-sm flex-col justify-center"
      >
        <Image
          className="mx-auto mb-8 w-2/3"
          alt="Logo FACOM"
          src={LogoFacom}
        />

        <div className="mb-6 grid max-w-6xl gap-6">
          <div className="w-full">
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-slate-950"
            >
              Usuário
            </label>
            <input
              type="text"
              id="username"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Usuário"
              required
              {...register("username")}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-950"
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Senha"
              required
              {...register("password")}
            />
          </div>
        </div>
        <button
          type="submit"
          className="mb-4 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Entrar
        </button>
        <Link href="/cadastro">Não tem uma conta? Cadastre aqui.</Link>
      </form>
    </main>
  );
};

export default Home;
