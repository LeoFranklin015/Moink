"use client";

import { Navbar } from "@/components/Navbar";
import { VerifyButton } from "@/components/VerifyButton";
import { FramePreview } from "@/components/FramePreview";
import { useAccount } from "wagmi";
import { usePartner } from "@/hooks/usePartner";
import { useState, useEffect } from "react";
import type { VerificationResults } from "@mocanetwork/air-credential-sdk";
import type { FrameConfig } from "@/app/builder/page";

export default function DonatePage({ configId }: { configId: string }) {
  const {
    address,
    chainId,
    isConnected,
    isReconnecting,
    isConnecting: isAccountConnecting,
  } = useAccount();

  const { partnerId } = usePartner();

  const [config, setConfig] = useState<FrameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] =
    useState<VerificationResults | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      if (!configId) {
        setError("No config ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/configs?id=${configId}`);
        const data = await response.json();

        if (data.success) {
          setConfig(data.config);
        } else {
          setError(data.error || "Failed to load config");
        }
      } catch (err) {
        console.error("Error fetching config:", err);
        setError("Failed to load frame configuration");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [configId]);

  const handleVerificationComplete = (results: VerificationResults) => {
    console.log("Verification completed:", results);
    setVerificationResults(results);
    setErrorMessage(null);

    // You can add more logic here, like showing a success message or redirecting
    alert(`Verification completed! Status: ${results.status}`);
  };

  const handleVerificationError = (error: string) => {
    console.error("Verification error:", error);
    setErrorMessage(error);
    setVerificationResults(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          <p>Loading frame...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !config) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Frame Not Found</h1>
          <p className="text-white/70 mb-6">
            {error || "The requested frame could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Frame Display */}
        <div className="flex items-center justify-center mb-8">
          <FramePreview config={config} />
        </div>

        {/* Verification Section - Only show if connected */}
        {isConnected && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              Credential Verification
            </h3>

            <div className="space-y-4">
              <VerifyButton
                partnerId={partnerId}
                verifierDid={
                  process.env.NEXT_PUBLIC_VERIFIER_DID ||
                  "did:example:verifier123"
                }
                apiKey={
                  process.env.NEXT_PUBLIC_VERIFIER_API_KEY ||
                  "your-verifier-api-key"
                }
                programId={
                  process.env.NEXT_PUBLIC_PROGRAM_ID || "c21hg030taxui0091199Ic"
                }
                redirectUrlForIssuer={
                  process.env.NEXT_PUBLIC_REDIRECT_URL_FOR_ISSUER ||
                  "http://localhost:3000/issue"
                }
                onVerificationComplete={handleVerificationComplete}
                onError={handleVerificationError}
                className="w-full"
              />

              {/* Verification Results Display */}
              {verificationResults && (
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-md">
                  <h4 className="text-sm font-medium text-green-400 mb-2">
                    ✅ Verification Results
                  </h4>
                  <div className="text-sm text-green-300">
                    <p>
                      <strong>Status:</strong> {verificationResults.status}
                    </p>
                    <p>
                      <strong>Credential ID:</strong>{" "}
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(verificationResults as any).credentialId || "N/A"}
                    </p>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(verificationResults as any).verificationTime && (
                      <p>
                        <strong>Verified At:</strong>{" "}
                        {new Date(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (verificationResults as any).verificationTime
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <details className="mt-2">
                    <summary className="text-xs text-green-400 cursor-pointer">
                      View Full Results
                    </summary>
                    <pre className="text-xs text-green-300 bg-green-500/10 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(verificationResults, null, 2)}
                    </pre>
                  </details>
                </div>
              )}

              {/* Error Display */}
              {errorMessage && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-md">
                  <h4 className="text-sm font-medium text-red-400 mb-2">
                    ❌ Verification Error
                  </h4>
                  <p className="text-sm text-red-300">{errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connection prompt for non-connected users */}
        {!isConnected && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 max-w-2xl mx-auto text-center">
            <p className="text-yellow-400 mb-4">
              ⚠️ Connect your wallet to interact with this frame and use
              verification features.
            </p>
            <Navbar />
          </div>
        )}

        {/* Connection Details (if connected) */}
        {isConnected && (
          <div className="mt-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-white mb-4">
              Connection Details
            </h2>
            <pre className="text-xs bg-black/50 p-4 rounded-md text-gray-300 overflow-x-auto">
              {JSON.stringify(
                {
                  address,
                  chainId,
                  isAccountConnecting,
                  isReconnecting,
                  isConnected,
                  partnerId,
                },
                null,
                2
              )}
            </pre>
            {isReconnecting && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <p className="text-sm text-yellow-400">
                  🔄 Reconnecting to wallet...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
