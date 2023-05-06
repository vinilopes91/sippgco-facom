import { type NextPage } from "next";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { z } from "zod";

import LogoFacom from "public/images/logo-facom.png";
import Input from "@/components/Input";
import Container from "@/components/Container";
import { useState } from "react";
import Button from "@/components/Button";

const Home: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signInSchema = z.object({
    username: z.string().min(1, "Campo obrigatório"),
    password: z.string().min(1, "Campo obrigatório"),
  });
  type LoginSchema = z.infer<typeof signInSchema>;
  const { register, handleSubmit, formState } = useForm<LoginSchema>({
    resolver: zodResolver(signInSchema),
  });

  const { errors } = formState;

  const session = useSession();
  const router = useRouter();

  if (session.data?.user.role === "APPLICANT") {
    void router.push("/candidato");
  } else if (session.data?.user.role === "ADMIN") {
    void router.push("/secretario");
  }

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    try {
      const response = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (response?.status === 401) {
        toast.error("Credenciais inválidas");
      } else if (!response?.ok) {
        toast.error("Não foi possível realizar o login");
      }
    } catch (error) {
      toast.error("Serviço indisponível");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            <div className="mb-6 max-w-6xl space-y-2">
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
            </div>
            <Button type="submit" fullWidth disabled={isLoading}>
              Entrar
            </Button>
            <Link className="w-fit" href="/cadastro">
              Não tem uma conta? Cadastre aqui.
            </Link>
          </form>
        </div>
      </Container>
    </main>
  );
};

export default Home;
