"use client";

import { VerifyButton } from "@/components/VerifyButton";
import { useAppContext } from "@/contexts/AppContext";
import { useState, useEffect } from "react";
import type { VerificationResults } from "@mocanetwork/air-credential-sdk";
import type { FrameConfig } from "@/app/builder/page";
import { LoginButton } from "@/components/common/LoginButton";

export default function DonatePage({ configId }: { configId: string }) {
  const { isLoggedIn, partnerId } = useAppContext();

  const [config, setConfig] = useState<FrameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] =
    useState<VerificationResults | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAbi, setShowAbi] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [functionInputs, setFunctionInputs] = useState<any[]>([]);

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

  const parseAbiAndFindFunction = (): any[] | null => {
    try {
      if (!config?.abi || !config?.functionName) {
        setErrorMessage("ABI or function name not provided");
        return null;
      }

      const parsedAbi = JSON.parse(config.abi);
      const targetFunction = parsedAbi.find(
        (item: any) =>
          item.type === "function" && item.name === config.functionName
      );

      if (!targetFunction) {
        setErrorMessage(`Function "${config.functionName}" not found in ABI`);
        return null;
      }

      return targetFunction.inputs || [];
    } catch (err) {
      console.log(err);
      setErrorMessage("Invalid ABI format");
      return null;
    }
  };

  const handleVerificationComplete = (results: VerificationResults) => {
    console.log("Verification completed:", results);
    setVerificationResults(results);
    setErrorMessage(null);

    // Parse ABI and show inputs
    const inputs = parseAbiAndFindFunction();
    if (inputs) {
      setFunctionInputs(inputs);
      // Initialize input values
      const initialValues: Record<string, string> = {};
      inputs.forEach((input: any) => {
        initialValues[input.name] = "";
      });
      setInputValues(initialValues);
      setShowInputs(true);
    } else {
      setShowAbi(true);
    }
  };

  const handleVerificationError = (error: string) => {
    console.error("Verification error:", error);
    setErrorMessage(error);
    setVerificationResults(null);
  };

  const handleInputChange = (paramName: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const handleBack = () => {
    setShowInputs(false);
    setShowAbi(false);
    setErrorMessage(null);
  };

  const handleExecuteFunction = () => {
    console.log("Executing function with values:", inputValues);
    // Here you would typically call the smart contract function
    setShowInputs(false);
    setShowAbi(true);
  };

  const getInputPlaceholder = (type: string) => {
    if (type.includes("address")) return "0x...";
    if (type.includes("uint")) return "0";
    if (type.includes("string")) return "Enter text";
    if (type.includes("bool")) return "true/false";
    return `${type} value`;
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
          <h1 className="text-2xl font-bold mb-4 font-cinzel">
            Frame Not Found
          </h1>
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
          <h1 className="text-2xl font-bold mb-4 font-cinzel">
            Login Required
          </h1>
          <p className="text-white/70 mb-6">
            Please login to access this frame and use verification features.
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Frame Display - Full coverage with better blur */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <div
              className="rounded-xl overflow-hidden relative aspect-[4/4]"
              style={{ backgroundColor: config.backgroundColor }}
            >
              {/* Extended blur background - covers entire frame */}
              {config.backgroundImage && (
                <>
                  {/* Full blur coverage background */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${config.backgroundImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      filter: "blur(25px)",
                      transform: "scale(1.2)",
                    }}
                  />
                  {/* Stronger blur overlay for better coverage */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${config.backgroundImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      filter: "blur(15px)",
                      opacity: 0.7,
                      transform: "scale(1.15)",
                    }}
                  />
                  {/* Main image layer */}
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

              {/* Enhanced gradient overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />

              <div className="relative z-10 p-8 h-full flex flex-col justify-center items-start text-left">
                {!showInputs ? (
                  <>
                    {/* Logo positioned at top left */}
                    <div className="mb-8">
                      {config.logo && (
                        <img
                          src={config.logo}
                          alt="Logo"
                          className="h-24 w-24 object-cover rounded-full border-4 border-white/40 shadow-2xl"
                        />
                      )}
                    </div>

                    {/* Centered main content */}
                    <div className="max-w-lg">
                      <h1
                        className="text-4xl font-bold text-white mb-6 leading-tight font-cinzel"
                        style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.9)" }}
                      >
                        {config.title}
                      </h1>
                      <p
                        className="text-white/95 text-lg mb-8 leading-relaxed"
                        style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}
                      >
                        {config.description}
                      </p>
                      <div className="flex items-center justify-start gap-2 text-sm text-white/80 mb-8">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span
                          className="font-cinzel font-medium"
                          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                        >
                          {config.verificationRequirement}
                        </span>
                      </div>
                    </div>

                    {/* Left-aligned Verification Button */}
                    <div className="mt-4">
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
                        className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 shadow-2xl text-white border-2 border-white/30 backdrop-blur-sm font-cinzel"
                        style={{
                          backgroundColor: config.buttonColor || "#f97316",
                          textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                        }}
                      />
                    </div>
                  </>
                ) : (
                  /* ABI Input Form - Centered overlay */
                  <div className="w-full max-w-md bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-2xl">
                    <div className="mb-6 text-center">
                      <h4
                        className="text-white font-semibold text-xl mb-2 font-cinzel"
                        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                      >
                        Complete Verification
                      </h4>
                      <p className="text-white/70 text-sm">
                        Fill in the required parameters
                      </p>
                    </div>

                    {/* Function Inputs */}
                    <div className="space-y-4 mb-6">
                      {functionInputs.map((input: any, index: number) => (
                        <div key={index}>
                          <label className="block text-white/90 text-sm mb-2 font-medium font-cinzel">
                            {input.name}
                            <span className="text-white/70 ml-1 text-xs">
                              ({input.type})
                            </span>
                          </label>
                          <input
                            type="text"
                            value={inputValues[input.name] || ""}
                            onChange={(e) =>
                              handleInputChange(input.name, e.target.value)
                            }
                            placeholder={getInputPlaceholder(input.type)}
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-400/50 focus:bg-white/20 placeholder-white/50"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={handleBack}
                        className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium py-3 px-6 rounded-lg transition-colors text-base border border-white/30 font-cinzel"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleExecuteFunction}
                        disabled={functionInputs.some(
                          (input: any) => !inputValues[input.name]?.trim()
                        )}
                        className="flex-[2] text-white font-bold py-3 px-6 rounded-lg transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:scale-105 transform shadow-xl border-2 border-white/30 backdrop-blur-sm font-cinzel"
                        style={{
                          backgroundColor: functionInputs.some(
                            (input: any) => !inputValues[input.name]?.trim()
                          )
                            ? "#666"
                            : config.buttonColor || "#f97316",
                          textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                          boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
                        }}
                      >
                        Execute {config.functionName}
                      </button>
                    </div>
                  </div>
                )}
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
              <h3 className="text-lg font-semibold mb-4 font-cinzel">
                ABI Section
              </h3>
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
