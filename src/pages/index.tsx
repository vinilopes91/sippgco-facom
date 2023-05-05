import { type NextPage } from "next";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

import { useForm } from "react-hook-form";
import { type LoginSchema, signInSchema } from "@/common/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";

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

    console.log("signIn response", response);

    if (response?.status === 401) {
      toast.error("Credenciais inválidas");
    } else if (!response?.ok) {
      toast.error("Não foi possível realizar o login");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <form
        className="flex h-screen w-full items-center justify-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="card bg-base-100 w-96 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">PPGCO</h2>
            <input
              type="text"
              placeholder="Digite seu usuário"
              className="input input-bordered mt-2 w-full max-w-xs"
              {...register("username")}
            />
            <input
              type="password"
              placeholder="Digite sua senha"
              className="input input-bordered my-2 w-full max-w-xs"
              {...register("password")}
            />
            <div className="card-actions items-center justify-between">
              <Link href="/cadastro" className="link">
                Cadastro
              </Link>
              <button className="btn btn-secondary" type="submit">
                Login
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
};

export default Home;
