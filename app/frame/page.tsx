"use client";

import { VerifyButton } from "@/components/VerifyButton";
import { useAppContext } from "@/contexts/AppContext";
import { useState, useEffect } from "react";
import type { VerificationResults } from "@mocanetwork/air-credential-sdk";
import type { FrameConfig } from "@/app/builder/page";

export default function DonatePage({ configId }: { configId: string }) {
  const { isLoggedIn, partnerId } = useAppContext();

  const [config, setConfig] = useState<FrameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] =
    useState<VerificationResults | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAbi, setShowAbi] = useState(false);

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
    setShowAbi(true);
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

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-white text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>
          <p className="text-white/70 mb-6">
            Please login to access this frame and use verification features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Frame Display - Reconstructed inline */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-full max-w-2xl">
            <div
              className="rounded-xl overflow-hidden min-h-[400px] relative"
              style={{ backgroundColor: config.backgroundColor }}
            >
              {/* Background image with blur fallback */}
              {config.backgroundImage && (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${config.backgroundImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      filter: "blur(20px)",
                      transform: "scale(1.1)",
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${config.backgroundImage})`,
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                </>
              )}

              {/* Gradient overlay for text visibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

              <div className="relative z-10 p-8 h-full flex flex-col">
                {/* Logo positioned top right */}
                <div className="flex justify-end mb-6">
                  {config.logo && (
                    <img
                      src={config.logo}
                      alt="Logo"
                      className="h-20 w-20 object-cover rounded-full border-3 border-white/40 shadow-lg"
                    />
                  )}
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="max-w-md">
                    <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                      {config.title}
                    </h1>
                    <p className="text-white/90 text-lg mb-6 leading-relaxed">
                      {config.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-white/70 mb-6">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>{config.verificationRequirement}</span>
                    </div>
                  </div>

                  {/* Verification Button integrated into frame */}
                  <div className="mt-8">
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
                        config.credentialId ||
                        process.env.NEXT_PUBLIC_PROGRAM_ID ||
                        "c21hg030taxui0091199Ic"
                      }
                      redirectUrlForIssuer={
                        process.env.NEXT_PUBLIC_REDIRECT_URL_FOR_ISSUER ||
                        "http://localhost:3000/issue"
                      }
                      onVerificationComplete={handleVerificationComplete}
                      onError={handleVerificationError}
                      text={config.buttonText}
                      className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 shadow-lg text-white ${
                        config.buttonColor
                          ? ""
                          : "bg-orange-500 hover:bg-orange-600"
                      }`}
                      style={
                        config.buttonColor
                          ? { backgroundColor: config.buttonColor }
                          : {}
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {errorMessage && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="p-4 bg-red-500/10 text-red-300 rounded-lg">
              <p>❌ {errorMessage}</p>
            </div>
          </div>
        )}

        {/* ABI Section - Show after verification */}
        {showAbi && verificationResults && (
          <div className="max-w-2xl mx-auto">
            <div className="p-6 bg-white text-black rounded-lg">
              <h3 className="text-lg font-semibold mb-4">ABI Section</h3>
              <div className="space-y-2">
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
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">
                    View Full Verification Results
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 text-sm overflow-auto">
                    {JSON.stringify(verificationResults, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
