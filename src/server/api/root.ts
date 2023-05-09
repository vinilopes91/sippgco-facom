import { createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "@/server/api/routers/user";
import { authRouter } from "@/server/api/routers/auth";
import { processRouter } from "@/server/api/routers/process";
import { researchLineRouter } from "@/server/api/routers/researchLine";
import { documentRouter } from "@/server/api/routers/document";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  auth: authRouter,
  process: processRouter,
  researchLine: researchLineRouter,
  document: documentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
