import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import emailSyncRoute from "./routes/email/sync/route";
import emailSummaryRoute from "./routes/email/summary/route";
import emailSendRoute from "./routes/email/send/route";
import emailAnalyzeRoute from "./routes/email/analyze/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  email: createTRPCRouter({
    sync: emailSyncRoute,
    summary: emailSummaryRoute,
    send: emailSendRoute,
    analyze: emailAnalyzeRoute,
  }),
});

export type AppRouter = typeof appRouter;