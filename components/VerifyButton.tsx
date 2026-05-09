"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { useAirkit } from "@/components/AirkitProvider";
import { getAuthToken } from "@/lib/airkit-auth";

type VerificationResult = {
  status: string;
  zkProofs?: Record<string, string>;
  transactionHash?: string;
};

interface VerifyButtonProps {
  programId?: string;
  redirectUrlForIssuer?: string;
  onVerificationComplete?: (result: VerificationResult) => void;
  onError?: (error: string) => void;
  className?: string;
  text?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export const VerifyButton: React.FC<VerifyButtonProps> = ({
  programId = process.env.NEXT_PUBLIC_PROGRAM_ID || "",
  redirectUrlForIssuer,
  onVerificationComplete,
  onError,
  className = "",
  text,
  style,
  children,
}) => {
  const { service: airService, isLoggedIn, isInitialized } = useAirkit();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!airService) {
      const msg = "AirService not initialized";
      setError(msg);
      onError?.(msg);
      return;
    }
    if (!isLoggedIn) {
      const msg = "Please login first";
      setError(msg);
      onError?.(msg);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const jwt = await getAuthToken("verify");
      const result = await airService.verifyCredential({
        authToken: jwt,
        programId,
        redirectUrl: redirectUrlForIssuer || undefined,
      });
      onVerificationComplete?.(result.verificationResult);
    } catch (err) {
      const msg = `Verification error: ${err instanceof Error ? err.message : "Unknown error"}`;
      setError(msg);
      onError?.(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const label = (() => {
    if (isLoading) return "Verifying...";
    if (!isInitialized) return "Initializing...";
    if (!isLoggedIn) return "Login Required";
    if (children) return children;
    if (text) return text;
    return "Verify Credential";
  })();

  const disabled = isLoading || !isInitialized || !isLoggedIn;

  return (
    <div className="verify-button-container">
      <button onClick={handleClick} disabled={disabled} style={style} className={className}>
        {label}
      </button>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
};
