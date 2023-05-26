import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useSession } from "next-auth/react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { signUpSchema, type SignUpSchema } from "@/common/validation/auth";
import { api } from "@/utils/api";
import LogoFacom from "public/images/logo-facom.png";
import Container from "@/components/Container";
import Input from "@/components/Input";
import clsx from "clsx";
import { handleTRPCError } from "@/utils/errors";

const Cadastro: NextPage = () => {
  const router = useRouter();
  const session = useSession();

  if (session.data?.user.role === "APPLICANT") {
    void router.push("/candidato");
  } else if (session.data?.user.role === "ADMIN") {
    void router.push("/secretario");
  }

  const { register, handleSubmit, formState } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  const { errors } = formState;

  const { mutateAsync, isLoading } = api.auth.signUp.useMutation();

  const onSubmit = async (data: SignUpSchema) => {
    try {
      const result = await mutateAsync(data);
      if (result.status === 201) {
        await router.push("/");
      }
    } catch (error) {
      handleTRPCError(error);
    }
  };

  return (
    <>
      <Head>
        <title>PPGCO - Cadastro de usuário</title>
      </Head>

      <main className="flex min-h-screen flex-col items-center justify-center">
        <Container>
          <div className="flex flex-col items-center justify-center">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full max-w-sm flex-col justify-center"
            >
              <Image
                className="mx-auto mb-8 rounded-sm sm:w-full md:w-2/3"
                alt="Logo FACOM"
                src={LogoFacom}
                priority
              />
              <div className="mb-6 flex max-w-6xl flex-col items-center space-y-2">
                <Input
                  name="name"
                  label="Nome completo"
                  placeholder="Nome completo"
                  required
                  register={register}
                  error={errors.name}
                />
                <Input
                  name="email"
                  label="E-mail"
                  placeholder="E-mail"
                  required
                  register={register}
                  error={errors.email}
                />
                <Input
                  name="username"
                  label="Usuário"
                  placeholder="Usuário"
                  required
                  register={register}
                  error={errors.username}
                />
                <Input
                  name="password"
                  type="password"
                  label="Senha"
                  placeholder="Senha"
                  required
                  register={register}
                  error={errors.password}
                />
                <Input
                  name="confirmPassword"
                  type="password"
                  label="Confirmar senha"
                  placeholder="Confirmar senha"
                  required
                  register={register}
                  error={errors.confirmPassword}
                />
              </div>
              <button
                className={clsx("btn-primary btn", isLoading && "loading")}
                type="submit"
                disabled={isLoading}
              >
                Registrar
              </button>
              <Link className="mt-3 w-fit" href="/">
                Retornar ao login.
              </Link>
            </form>
          </div>
        </Container>
      </main>
    </>
  );
};

export default Cadastro;
