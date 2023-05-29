import bcrypt from "bcrypt";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { signUpSchema } from "@/common/validation/auth";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input, ctx }) => {
      const { username, email, password, name } = input;

      const usernameAlreadyExists = await ctx.prisma.user.findFirst({
        where: { username },
      });

      if (usernameAlreadyExists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe uma conta com este usuário",
        });
      }

      const emailAlreadyExists = await ctx.prisma.user.findFirst({
        where: { email },
      });

      if (emailAlreadyExists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe uma conta com este e-mail",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const userCreated = await ctx.prisma.user.create({
        data: { username, email, password: hashedPassword, name },
      });

      return {
        status: 201,
        message: "Account created successfully",
        username: userCreated.username,
      };
    }),
});
