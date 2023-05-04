import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpSchema } from "@/common/validation/auth";
import { api } from "@/utils/api";

const SignUp: NextPage = () => {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  const { errors } = formState

  console.log(errors)

  const { mutateAsync, isLoading } = api.auth.signUp.useMutation();
  
  const onSubmit = 
    async (data: SignUpSchema) => {
      console.log(data)
      const result = await mutateAsync(data);
      if (result.status === 201) {
        await router.push("/")
      }
    };

  return (
    <div>
      <Head>
        <title>PPGCO - Cadastro de usuário</title>
      </Head>

      <main>
        <form
          className="flex items-center justify-center h-screen w-full"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Create an account!</h2>
              <input
                type="text"
                placeholder="Type your name..."
                className="input input-bordered w-full max-w-xs my-2"
                {...register("name")}
              />
              <input
                type="email"
                placeholder="Type your email..."
                className="input input-bordered w-full max-w-xs"
                {...register("email")}
              />
              <input
                type="text"
                placeholder="Type your username..."
                className="input input-bordered w-full max-w-xs my-2"
                {...register("username")}
              />
              <input
                type="password"
                placeholder="Type your password..."
                className="input input-bordered w-full max-w-xs my-2"
                {...register("password")}
              />
              <input
                type="password"
                placeholder="Confirm your password..."
                className="input input-bordered w-full max-w-xs my-2"
                maxLength={12}
                minLength={3}
                {...register("confirmPassword")}
              />
              <div className="card-actions items-center justify-between">
                <Link href="/" className="link">
                  Ir para o login
                </Link>
                <button className="btn btn-secondary" type="submit" disabled={isLoading}>
                  Registrar
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SignUp;