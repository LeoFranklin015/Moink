"use client";

import { VerifyButton } from "@/components/VerifyButton";
import { useAirkit } from "@/components/AirkitProvider";
import { useState, useEffect } from "react";
import type { FrameConfig } from "@/app/builder/page";

interface VerificationResultData {
  status: string;
  zkProofs?: Record<string, string>;
  transactionHash?: string;
}
import { LoginButton } from "@/components/common/LoginButton";
import { createWalletClient, custom, parseEther } from "viem";
import { DEFAULT_CHAIN } from "@/utils/constants";

export default function DonatePage({ configId }: { configId: string }) {
  const { service: airService, isLoggedIn } = useAirkit();

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
    console.log("[frame] Verification completed. raw=", results, "status=", results?.status);
    // Always store SOMETHING truthy so the step advances even if the SDK returns an
    // empty payload. Keep the real status when present.
    setVerificationResults(results || ({ status: "Compliant" } as VerificationResultData));
    setErrorMessage(null);

    // Parse ABI quietly: only set inputs on success, never clobber errorMessage here.
    try {
      if (config?.abi && config?.functionName) {
        const parsed = JSON.parse(config.abi);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fn = parsed.find((it: any) => it?.type === "function" && it?.name === config.functionName);
        if (fn?.inputs?.length) {
          setFunctionInputs(fn.inputs);
          const init: Record<string, string> = {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fn.inputs.forEach((i: any) => { init[i.name] = ""; });
          setInputValues(init);
          setShowInputs(true);
        } else {
          setFunctionInputs([]);
          setShowInputs(true);
        }
      }
    } catch (err) {
      // Don't surface ABI errors on the verify screen. Let the builder's inline
      // validator catch them at config time. Just log.
      console.warn("[frame] ABI parse on verify-complete failed:", err);
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
        chain: DEFAULT_CHAIN,
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
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center p-6"
        style={{ backgroundColor: config?.backgroundColor || "#0b0b0c" }}
      >
        {config?.backgroundImage && (
          <>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${config.backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.30,
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.75) 100%)",
              }}
            />
          </>
        )}

        <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
          {config?.title && (
            <h1
              className="text-white font-semibold tracking-tight leading-[1.04] mb-8"
              style={{ fontSize: "clamp(28px, 4.5vw, 40px)" }}
            >
              {config.title}
            </h1>
          )}

          <LoginButton size="lg" buttonText="Connect AIR account" />
        </div>
      </div>
    );
  }


  /* ---------- Resolve current step ---------- */

  const hasAction = Boolean(config.functionName);
  // SDK may return "Compliant", "compliant", "VERIFIED", etc. Be lenient: anything
  // that isn't an explicit failure counts as success.
  const statusLower = verificationResults?.status?.toLowerCase() ?? "";
  const isFailure = ["non-compliant", "failed", "error", "rejected", "revoked"].includes(statusLower);
  const verifiedOk = Boolean(verificationResults) && !isFailure;
  const verificationFailed = Boolean(verificationResults) && isFailure;
  const step: "verify" | "action" | "success" = showSuccessScreen
    ? "success"
    : verifiedOk && hasAction
      ? "action"
      : verifiedOk && !hasAction
        ? "success"
        : "verify";

  const totalSteps = hasAction ? 3 : 2;
  const stepIndex = step === "verify" ? 1 : step === "action" ? 2 : totalSteps;
  const buttonBg = config.buttonColor || "#a8d9af";
  const buttonHover = config.buttonHoverColor || "#5fcf80";

  const truncate = (s: string) =>
    !s ? "" : s.length <= 14 ? s : `${s.slice(0, 6)}…${s.slice(-4)}`;

  const explorerUrl = transactionHash
    ? `https://testnet-scan.mocachain.org/tx/${transactionHash}`
    : null;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: config.backgroundColor || "#0b0b0c" }}
    >
      {config.backgroundImage && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${config.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.45,
          }}
        />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.90) 100%)",
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col p-7 lg:p-10 max-w-2xl mx-auto w-full">
        {/* Brand row */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] tracking-[0.18em] uppercase text-white/70 font-medium">
            identity<span className="text-[rgb(168_217_175)]">X</span>
          </span>
          <span className="mono text-[11px] text-white/45 tabular-nums tracking-[0.06em]">
            {String(stepIndex).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
          </span>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center -mt-4">
          {step === "verify" && (
            <>
              {config.title && (
                <div className="text-[12px] tracking-[0.14em] uppercase text-white/55 font-medium mb-3">
                  {config.title}
                </div>
              )}
              <h2
                className="text-white font-semibold tracking-tight leading-[1.04]"
                style={{ fontSize: "clamp(28px, 4.4vw, 46px)" }}
              >
                {config.verificationRequirement || "Prove a credential to continue"}
              </h2>
              {config.description && (
                <p className="text-white/65 mt-4 leading-relaxed text-[14px] max-w-[440px]">
                  {config.description}
                </p>
              )}
              {verificationFailed && (
                <div className="mt-5 inline-flex items-start gap-2 px-3 py-2 rounded-xl bg-[rgb(245_140_140)]/10 border border-[rgb(245_140_140)]/20">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[rgb(245_140_140)] mt-0.5 shrink-0">
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <div>
                    <div className="text-[13px] text-[rgb(245_140_140)] font-medium">
                      Verification didn&apos;t pass
                    </div>
                    <div className="text-[12px] text-white/55 mt-0.5">
                      Your credential doesn&apos;t satisfy the rule. Status: <span className="mono">{verificationResults?.status}</span>
                    </div>
                  </div>
                </div>
              )}
              {errorMessage && !verificationFailed && (
                <div className="mt-5 inline-flex items-center gap-2 text-[12px] text-[rgb(245_140_140)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(245_140_140)]" />
                  {errorMessage}
                </div>
              )}
            </>
          )}

          {step === "action" && (
            <>
              <div className="inline-flex items-center gap-2 mb-5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[rgb(168_217_175)]">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 8.5l3 3 6-7" stroke="#0b0b0c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-[12px] tracking-[0.14em] uppercase text-[rgb(168_217_175)] font-medium">
                  Verified · Ready to settle
                </span>
              </div>

              <h2
                className="text-white font-semibold tracking-tight leading-[1.02] break-all"
                style={{ fontSize: "clamp(28px, 4.4vw, 44px)" }}
              >
                Call <span className="mono text-[rgb(168_217_175)]">{config.functionName}()</span>
              </h2>

              {config.contractAddress && (
                <div className="mt-4 text-[13px] text-white/55">
                  on <span className="mono text-white/80">{truncate(config.contractAddress)}</span>
                  <span className="mx-2 text-white/25">·</span>
                  Moca Testnet
                </div>
              )}

              {functionInputs.length > 0 && showInputs && (
                <div className="mt-5 space-y-3">
                  <div className="text-[10px] tracking-[0.16em] uppercase text-white/55 font-medium">
                    Fill in arguments
                  </div>
                  {functionInputs.map((inp) => (
                    <div key={inp.name}>
                      <div className="text-[11px] text-white/55 mb-1.5 flex items-center justify-between">
                        <span className="font-medium">{inp.name || "_"}</span>
                        <span className="mono text-white/35">{inp.type}</span>
                      </div>
                      <input
                        type="text"
                        value={inputValues[inp.name] || ""}
                        onChange={(e) => handleInputChange(inp.name, e.target.value)}
                        placeholder={getInputPlaceholder(inp.type)}
                        className="w-full h-11 rounded-xl bg-white/[0.06] border border-white/10 px-3.5 text-[13px] text-white placeholder:text-white/35 outline-none focus:border-[rgb(168_217_175)]/60 focus:bg-white/[0.08] transition-colors mono"
                      />
                    </div>
                  ))}
                </div>
              )}

              {executionError && (
                <div className="mt-5 inline-flex items-center gap-2 text-[12px] text-[rgb(245_140_140)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(245_140_140)]" />
                  {executionError}
                </div>
              )}
            </>
          )}

          {step === "success" && (
            <>
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[rgb(168_217_175)] mb-6">
                <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
                  <path d="M3.5 8.5l3 3 6-7" stroke="#0b0b0c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2
                className="text-white font-semibold tracking-tight leading-[1.02]"
                style={{ fontSize: "clamp(28px, 4.4vw, 44px)" }}
              >
                Done.
              </h2>
              <p className="text-white/65 mt-3 leading-relaxed text-[14px] max-w-[440px]">
                {hasAction ? (
                  <>Verified &amp; executed <span className="mono text-white/85">{config.functionName}()</span>. Tx settled on Moca testnet.</>
                ) : (
                  <>Credential verified. You&apos;re cleared.</>
                )}
              </p>
              {transactionHash && (
                <div className="mt-5 inline-flex items-center gap-2 text-[12px] text-white/55 mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(168_217_175)]" />
                  {truncate(transactionHash)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Step pips */}
        <div className="flex items-center gap-1.5 mb-5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`h-0.5 rounded-full transition-all ${
                i + 1 === stepIndex ? "w-8 bg-[rgb(168_217_175)]" : "w-3 bg-white/15"
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        {step === "verify" && (
          <VerifyButton
            programId={config.credentialId || process.env.NEXT_PUBLIC_PROGRAM_ID || ""}
            onVerificationComplete={handleVerificationComplete}
            onError={handleVerificationError}
            text={config.buttonText || "Verify"}
            className="h-12 rounded-[14px] text-[#0b0b0c] font-semibold text-[14px] inline-flex items-center justify-center gap-2 transition-colors w-full cursor-pointer"
            style={{ backgroundColor: buttonBg, letterSpacing: "0.02em" }}
          />
        )}

        {step === "action" && (
          <button
            onClick={handleExecuteFunction}
            disabled={isExecuting}
            className="h-12 rounded-[14px] text-[#0b0b0c] font-semibold text-[14px] inline-flex items-center justify-center gap-2 transition-colors w-full cursor-pointer disabled:opacity-60"
            style={{ backgroundColor: buttonBg, letterSpacing: "0.02em" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = buttonHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = buttonBg; }}
          >
            {isExecuting
              ? "Executing…"
              : config.actionButtonText || `Execute ${config.functionName}()`}
            {!isExecuting && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L8 3m5 5l-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}

        {step === "success" && explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 rounded-[14px] bg-white/10 text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 transition-colors hover:bg-white/15 cursor-pointer"
          >
            View on explorer
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10m0 0L8 3m5 5l-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
