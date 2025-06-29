"use client";

import { useAccount } from "wagmi";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  const {
    address,
    chainId,
    isConnected,
    isReconnecting,
    isConnecting: isAccountConnecting,
  } = useAccount();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome to Moink
        </h1>

        {isConnected && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Connection Details
            </h2>

            {/* Connection State Display */}
            <pre className="text-xs bg-gray-100 p-4 rounded-md text-gray-800 overflow-x-auto">
              {JSON.stringify(
                {
                  address,
                  chainId,
                  isAccountConnecting,
                  isReconnecting,
                  isConnected,
                },
                null,
                2
              )}
            </pre>

            {isReconnecting && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  🔄 Reconnecting to wallet...
                </p>
              </div>
            )}
          </div>
        )}

        {!isConnected && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 mb-6">
                Please connect your wallet using the button in the navigation
                bar to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
