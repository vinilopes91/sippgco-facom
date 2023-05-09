import {
  createTRPCRouter,
  enforceUserIsAdmin,
  protectedProcedure,
} from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  list: protectedProcedure.use(enforceUserIsAdmin).query(({ ctx }) => {
    const userList = ctx.prisma.user.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        username: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return userList;
  }),
});
