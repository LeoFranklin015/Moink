"use client";

import { Navbar } from "@/components/Navbar";
import { VerifyButton } from "@/components/VerifyButton";
import { useAccount } from "wagmi";
import { usePartner } from "@/hooks/usePartner";
import { useState } from "react";
import type { VerificationResults } from "@mocanetwork/air-credential-sdk";

export default function DonatePage() {
  const {
    address,
    chainId,
    isConnected,
    isReconnecting,
    isConnecting: isAccountConnecting,
  } = useAccount();

  const { partnerId } = usePartner();
  const [verificationResults, setVerificationResults] =
    useState<VerificationResults | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Hello</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">World</h2>
        <h3 className="text-2xl font-medium text-gray-700 mb-2">Hello</h3>
        <h4 className="text-xl text-gray-600 mb-2">World</h4>
        <h5 className="text-lg text-gray-500 mb-2">Hello</h5>
        <h6 className="text-base text-gray-400 mb-4">World</h6>
        <p className="text-gray-600 mb-2">Hello</p>
        <p className="text-gray-600 mb-6">World</p>

        <Navbar />

        {/* Verification Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Credential Verification
          </h3>

          {!isConnected ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
              <p className="text-yellow-800">
                ⚠️ Please connect your wallet to use verification features.
              </p>
            </div>
          ) : (
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
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h4 className="text-sm font-medium text-green-900 mb-2">
                    ✅ Verification Results
                  </h4>
                  <div className="text-sm text-green-800">
                    <p>
                      <strong>Status:</strong> {verificationResults.status}
                    </p>
                    <p>
                      <strong>Credential ID:</strong>{" "}
                      {(verificationResults as any).credentialId || "N/A"}
                    </p>
                    {(verificationResults as any).verificationTime && (
                      <p>
                        <strong>Verified At:</strong>{" "}
                        {new Date(
                          (verificationResults as any).verificationTime
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <details className="mt-2">
                    <summary className="text-xs text-green-700 cursor-pointer">
                      View Full Results
                    </summary>
                    <pre className="text-xs text-green-600 bg-green-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(verificationResults, null, 2)}
                    </pre>
                  </details>
                </div>
              )}

              {/* Error Display */}
              {errorMessage && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <h4 className="text-sm font-medium text-red-900 mb-2">
                    ❌ Verification Error
                  </h4>
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Connection Details (if connected) */}
        {isConnected && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Connection Details
            </h2>
            <pre className="text-xs bg-gray-100 p-4 rounded-md text-gray-800 overflow-x-auto">
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
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
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
