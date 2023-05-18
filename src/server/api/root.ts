import { createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "@/server/api/routers/user";
import { authRouter } from "@/server/api/routers/auth";
import { processRouter } from "@/server/api/routers/process";
import { researchLineRouter } from "@/server/api/routers/researchLine";
import { documentRouter } from "@/server/api/routers/document";
import { applicationRouter } from "@/server/api/routers/application";

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
  application: applicationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
