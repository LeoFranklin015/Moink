import { defineChain } from "viem";

export const baseSepolia = defineChain({
  id: 84532,
  name: "Base Sepolia",
  nativeCurrency: { decimals: 18, name: "Sepolia Ether", symbol: "ETH" },
  rpcUrls: { default: { http: ["https://sepolia.base.org"] } },
  blockExplorers: { default: { name: "BaseScan", url: "https://sepolia.basescan.org" } },
  testnet: true,
});

export const mocaTestnet = defineChain({
  id: 222888,
  name: "Moca Testnet",
  nativeCurrency: { decimals: 18, name: "Moca Network", symbol: "MOCA" },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.mocachain.org"],
      webSocket: ["wss://testnet-rpc.mocachain.org"],
    },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://testnet-scan.mocachain.org" },
  },
});

// Moca Testnet is enabled on this partner; AA wallet operates here.
export const DEFAULT_CHAIN = mocaTestnet;
