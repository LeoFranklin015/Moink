"use client";

import { VerifyButton } from "@/components/VerifyButton";
import { useAppContext } from "@/contexts/AppContext";
import { useState, useEffect } from "react";
import type { FrameConfig } from "@/app/builder/page";

interface VerificationResultData {
  status: string;
  zkProofs?: Record<string, string>;
  transactionHash?: string;
}
import { LoginButton } from "@/components/common/LoginButton";
import { createWalletClient, custom, parseEther } from "viem";
import { mocaTestnet } from "@/utils/constants";

export default function DonatePage({ configId }: { configId: string }) {
  const { airService, isLoggedIn } = useAppContext();

  const [config, setConfig] = useState<FrameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] =
    useState<VerificationResultData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAbi, setShowAbi] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [functionInputs, setFunctionInputs] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSuccess, setExecutionSuccess] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseAbiAndFindFunction = (): any[] | null => {
    try {
      if (!config?.abi || !config?.functionName) {
        setErrorMessage("ABI or function name not provided");
        return null;
      }

      const parsedAbi = JSON.parse(config.abi);
      const targetFunction = parsedAbi.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const handleVerificationComplete = (results: VerificationResultData) => {
    console.log("Verification completed:", results);
    setVerificationResults(results);
    setErrorMessage(null);

    // Parse ABI and show inputs
    const inputs = parseAbiAndFindFunction();
    if (inputs) {
      setFunctionInputs(inputs);
      // Initialize input values
      const initialValues: Record<string, string> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    setShowSuccessScreen(false);
    setErrorMessage(null);
    setExecutionError(null);
    setExecutionSuccess(false);
    setTransactionHash(null);
  };

  const handleCloseSuccessScreen = () => {
    setShowSuccessScreen(false);
    setShowAbi(true);
  };

  const handleExecuteFunction = async () => {
    if (!airService || !isLoggedIn || !config) {
      setExecutionError(
        "Please ensure you are logged in and have a valid configuration"
      );
      return;
    }

    setIsExecuting(true);
    setExecutionError(null);
    setExecutionSuccess(false);

    try {
      console.log("Executing function with values:", inputValues);

      // Parse the ABI to get the function details
      const parsedAbi = JSON.parse(config.abi);
      const targetFunction = parsedAbi.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) =>
          item.type === "function" && item.name === config.functionName
      );

      if (!targetFunction) {
        throw new Error(`Function "${config.functionName}" not found in ABI`);
      }

      // Prepare arguments array in the correct order
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const args: any[] = [];
      if (targetFunction.inputs && targetFunction.inputs.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        targetFunction.inputs.forEach((input: any) => {
          let value = inputValues[input.name];

          // Convert values based on type
          if (input.type.includes("uint") || input.type.includes("int")) {
            value = value || "0";
            args.push(BigInt(value));
          } else if (input.type.includes("bool")) {
            args.push(value.toLowerCase() === "true");
          } else if (input.type.includes("address")) {
            if (!value.startsWith("0x") || value.length !== 42) {
              throw new Error(`Invalid address format for ${input.name}`);
            }
            args.push(value as `0x${string}`);
          } else {
            // string or bytes
            args.push(value);
          }
        });
      }

      // Get the wallet client and make the contract call
      const airProvider = await airService.getProvider();
      const walletClient = createWalletClient({
        transport: custom(airProvider),
        chain: mocaTestnet,
      });

      const [aaAccount] = await walletClient.getAddresses();

      // Determine if the function is payable and needs ETH
      const isPayable = targetFunction.stateMutability === "payable";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contractCallParams: any = {
        abi: parsedAbi,
        address: config.contractAddress as `0x${string}`,
        functionName: config.functionName,
        account: aaAccount,
      };

      // Add args if the function has inputs
      if (args.length > 0) {
        contractCallParams.args = args;
      }

      // Add value if the function is payable (you might want to add a value input field in the UI)
      if (isPayable) {
        // For now, we'll use 0 ETH. You can extend this to include a value input field
        contractCallParams.value = parseEther("0");
      }

      console.log("Making contract call with params:", contractCallParams);

      const txHash = await walletClient.writeContract(contractCallParams);

      console.log("Transaction successful! Hash:", txHash);
      setTransactionHash(txHash);
      setExecutionSuccess(true);
      setShowInputs(false);
      setShowSuccessScreen(true);
    } catch (error) {
      console.error("Contract execution error:", error);
      setExecutionError(
        error instanceof Error ? error.message : "Contract execution failed"
      );
    } finally {
      setIsExecuting(false);
    }
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
                {showSuccessScreen ? (
                  /* Success Screen - Transaction Complete */
                  <div className="w-full max-w-lg bg-black/80 backdrop-blur-md border border-green-400/30 rounded-xl p-8 shadow-2xl">
                    <div className="text-center">
                      {/* Success Icon */}
                      <div className="mb-6">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-400/50">
                          <div className="text-4xl">🎉</div>
                        </div>
                        <h4
                          className="text-white font-bold text-2xl mb-2 font-cinzel"
                          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                        >
                          Transaction Successful!
                        </h4>
                        <p className="text-green-300 text-lg font-medium">
                          {config.functionName} executed successfully
                        </p>
                      </div>

                      {/* Transaction Details */}
                      <div className="space-y-4 mb-6">
                        <div className="p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
                          <p className="text-white/70 text-sm mb-2">
                            Transaction Hash:
                          </p>
                          <div className="flex items-center justify-between bg-black/40 rounded-lg p-3">
                            <code className="text-green-300 text-xs font-mono break-all mr-3">
                              {transactionHash}
                            </code>
                            <button
                              onClick={() =>
                                transactionHash &&
                                navigator.clipboard.writeText(transactionHash)
                              }
                              className="text-white/70 hover:text-white transition-colors flex-shrink-0"
                              title="Copy to clipboard"
                            >
                              📋
                            </button>
                          </div>
                        </div>

                        {/* Explorer Link */}
                        <a
                          href={`https://testnet-scan.mocachain.org/tx/${transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 rounded-lg p-4 transition-all duration-200 hover:scale-105"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-blue-300 font-medium">
                              View on Moca Explorer
                            </span>
                            <span className="text-blue-300">🔗</span>
                          </div>
                        </a>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={handleBack}
                          className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium py-3 px-6 rounded-lg transition-colors text-base border border-white/30 font-cinzel"
                        >
                          Start Over
                        </button>
                        <button
                          onClick={handleCloseSuccessScreen}
                          className="flex-1 bg-green-600/20 hover:bg-green-600/30 backdrop-blur-sm text-green-300 font-bold py-3 px-6 rounded-lg transition-colors text-base border border-green-400/30 font-cinzel"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ) : showInputs ? (
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
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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

                    {/* Execution Error Display */}
                    {executionError && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-300 text-sm">
                          ❌ {executionError}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={handleBack}
                        disabled={isExecuting}
                        className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium py-3 px-6 rounded-lg transition-colors text-base border border-white/30 font-cinzel disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleExecuteFunction}
                        disabled={
                          isExecuting ||
                          functionInputs.some(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (input: any) => !inputValues[input.name]?.trim()
                          )
                        }
                        className="flex-[2] text-white font-bold py-3 px-6 rounded-lg transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:scale-105 transform shadow-xl border-2 border-white/30 backdrop-blur-sm font-cinzel"
                        style={{
                          backgroundColor:
                            isExecuting ||
                            functionInputs.some(
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (input: any) => !inputValues[input.name]?.trim()
                            )
                              ? "#666"
                              : config.buttonColor || "#f97316",
                          textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                          boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
                        }}
                      >
                        {isExecuting
                          ? "Executing..."
                          : `Execute ${config.functionName}`}
                      </button>
                    </div>
                  </div>
                ) : (
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
                        programId={
                          config.credentialId ||
                          process.env.NEXT_PUBLIC_PROGRAM_ID ||
                          ""
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

        {/* Results Section - Show after verification or execution */}
        {showAbi && verificationResults && (
          <div className="max-w-2xl mx-auto">
            <div className="p-6 bg-white text-black rounded-lg">
              <h3 className="text-lg font-semibold mb-4 font-cinzel">
                Verification & Execution Results
              </h3>

              {/* Verification Results */}
              <div className="space-y-2 mb-6">
                <h4 className="font-medium text-lg">Verification Status</h4>
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

              {/* Contract Execution Results */}
              <div className="space-y-2 mb-6 border-t pt-4">
                <h4 className="font-medium text-lg">Contract Execution</h4>
                {executionSuccess && transactionHash ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700">
                    <p>
                      ✅ Contract function {config?.functionName} executed
                      successfully!
                    </p>
                    <p className="text-sm mt-1">
                      Transaction has been submitted to the blockchain.
                    </p>
                    <div className="mt-3 p-2 bg-green-100 rounded border">
                      <p className="text-xs text-green-600 mb-1">
                        Transaction Hash:
                      </p>
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-mono text-green-800 break-all mr-2">
                          {transactionHash}
                        </code>
                        <a
                          href={`https://testnet-scan.mocachain.org/tx/${transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs underline flex-shrink-0"
                        >
                          View on Explorer
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border rounded text-gray-700">
                    <p>⏳ Contract execution pending...</p>
                    <p className="text-sm">
                      Fill in the function parameters and click execute.
                    </p>
                  </div>
                )}
              </div>

              {/* Full Verification Results Details */}
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
        )}
      </div>
    </div>
  );
}
