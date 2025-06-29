"use client";
import { useConnect } from "wagmi";
import { useConfig } from "wagmi";
import { Button } from "../common/Button";
import { useState, useEffect } from "react";

export const DefaultLogin = () => {
  const { connect, isPending: isConnecting } = useConnect();
  const config = useConfig();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return (
      <div className="max-w-md mx-auto">
        <Button
          disabled
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Button
        onClick={() => {
          const airConnector = config.connectors.find(
            (connector) => connector?.isMocaNetwork
          );
          connect({
            connector: airConnector!,
          });
        }}
        disabled={isConnecting}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Connecting...
          </div>
        ) : (
          "Connect Wallet"
        )}
      </Button>
    </div>
  );
};
