"use client";
import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { getAuthToken } from "@/lib/airkit-auth";

interface VerificationResultData {
  status: string;
  zkProofs?: Record<string, string>;
  transactionHash?: string;
}

interface VerifyButtonProps {
  partnerId?: string;
  programId?: string;
  redirectUrlForIssuer?: string;
  onVerificationComplete?: (results: VerificationResultData) => void;
  onError?: (error: string) => void;
  className?: string;
  text?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const VerifyButton: React.FC<VerifyButtonProps> = ({
  programId = process.env.NEXT_PUBLIC_PROGRAM_ID || "",
  redirectUrlForIssuer = "https://moink.crevn.xyz/issue",
  onVerificationComplete,
  onError,
  className = "",
  text,
  style,
  children,
}) => {
  const { airService, isLoggedIn, isInitialized } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyClick = async () => {
    if (!airService) {
      const errorMsg = "AirService is not initialized. Please wait.";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (!isLoggedIn) {
      const errorMsg = "Please login first.";
      setError(errorMsg);
      onError?.(errorMsg);
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

      console.log("Verification result:", result);
      setError(null);
      onVerificationComplete?.(result.verificationResult);
    } catch (err) {
      const errorMsg = `Verification error: ${
        err instanceof Error ? err.message : "Unknown error"
      }`;
      console.error(errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Verifying...";
    if (!isInitialized) return "Initializing...";
    if (!isLoggedIn) return "Login Required";
    if (children) return children;
    if (text) return text;
    return "Verify Credential";
  };

  const isDisabled = () => {
    return isLoading || !isInitialized || !isLoggedIn;
  };

  return (
    <div className="verify-button-container">
      <button
        onClick={handleVerifyClick}
        disabled={isDisabled()}
        style={style}
        className={`px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isDisabled()
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500"
        } ${className}`}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 inline"
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
        )}
        {getButtonText()}
      </button>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
};
