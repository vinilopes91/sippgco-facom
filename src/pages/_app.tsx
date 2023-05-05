import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

import { api } from "@/utils/api";

import "@/styles/globals.css";
import Head from "next/head";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>PPGCO - FACOM/UFU</title>
        <meta
          name="description"
          content="Sistema de inscrições do PPGCO FACOM/UFU"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster position="bottom-right" reverseOrder={false} />
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
