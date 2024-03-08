import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Inter } from "next/font/google";

import "@rainbow-me/rainbowkit/styles.css";

import { api } from "@/utils/api";
import {
  polygon,
  polygonMumbai,
  mainnet,
  optimism,
  arbitrum,
  base,
  zora,
} from "wagmi/chains";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";

import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";

import "@/styles/globals.css";
import Layout from "@/components/Layout";
import GlobalContextProvider from "@/context/useGlobalContext/useGlobalContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygon, polygonMumbai],
  [
    infuraProvider({ apiKey: "76296a73cb4e40cc8cd34b6baba67185" }),
    publicProvider(),
  ],
);

const { connectors } = getDefaultWallets({
  appName: "Defi",
  projectId: "a4366cff35e36ff15a727d63029b5d04",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <GlobalContextProvider>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider
          chains={chains}
          initialChain={polygon}
          theme={darkTheme()}
        >
          <SessionProvider session={session}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </SessionProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </GlobalContextProvider>
  );
};

export default api.withTRPC(MyApp);
