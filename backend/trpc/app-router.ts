import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import emailSyncRoute from "./routes/email/sync/route";
import emailSummaryRoute from "./routes/email/summary/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  email: createTRPCRouter({
    sync: emailSyncRoute,
    summary: emailSummaryRoute,
  }),
});

export type AppRouter = typeof appRouter;