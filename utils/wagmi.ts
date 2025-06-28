import { airConnector } from "@mocanetwork/airkit-connector";
import { createConfig, http } from "wagmi";
import { baseSepolia, soneiumMinato } from "wagmi/chains";
import { BUILD_ENV, mocaTestnet } from "./constants";

// Cache for wagmi configurations to prevent multiple AuthMessageService instances
const configCache = new Map<string, ReturnType<typeof createConfig>>();

export const getConfig = (partnerId: string) => {
  // Return cached config if it exists
  if (configCache.has(partnerId)) {
    return configCache.get(partnerId)!;
  }

  const connectors = [
    airConnector({
      buildEnv: BUILD_ENV,
      enableLogging: true,
      partnerId,
    }),
  ];

  const config = createConfig({
    chains: [mocaTestnet, baseSepolia, soneiumMinato],
    transports: {
      [mocaTestnet.id]: http(),
      [baseSepolia.id]: http(),
      [soneiumMinato.id]: http(),
    },
    connectors,
  });

  // Cache the config for this partnerId
  configCache.set(partnerId, config);

  return config;
};
