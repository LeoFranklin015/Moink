"use client";
import { useState, useEffect, useRef } from "react";
import {
  AirCredentialWidget,
  type QueryRequest,
  type VerificationResults,
  type Language,
} from "@mocanetwork/air-credential-sdk";
import "@mocanetwork/air-credential-sdk/dist/style.css";
import { BUILD_ENV } from "@mocanetwork/airkit";
import { useAppContext } from "@/contexts/AppContext";

interface VerifyButtonProps {
  partnerId?: string; // Optional since we can use context partnerId
  verifierDid?: string;
  apiKey?: string;
  programId?: string;
  redirectUrlForIssuer?: string;
  onVerificationComplete?: (results: VerificationResults) => void;
  onError?: (error: string) => void;
  className?: string;
  text?: string; // Custom button text
  style?: React.CSSProperties; // Custom button styles
  children?: React.ReactNode;
}

const getVerifierAuthToken = async (
  verifierDid: string,
  apiKey: string,
  apiUrl: string
): Promise<string | null> => {
  try {
    const response = await fetch(`${apiUrl}/verifier/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        "X-Test": "true",
      },
      body: JSON.stringify({
        verifierDid: verifierDid,
        authToken: apiKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.code === 80000000 && data.data && data.data.token) {
      return data.data.token;
    } else {
      console.error(
        "Failed to get verifier auth token from API:",
        data.msg || "Unknown error"
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching verifier auth token:", error);
    return null;
  }
};

export const VerifyButton: React.FC<VerifyButtonProps> = ({
  partnerId: propPartnerId,
  verifierDid = process.env.NEXT_PUBLIC_VERIFIER_DID ||
    "did:example:verifier123",
  apiKey = process.env.NEXT_PUBLIC_VERIFIER_API_KEY || "your-verifier-api-key",
  programId = process.env.NEXT_PUBLIC_PROGRAM_ID || "c21hg030taxui0091199Ic",
  redirectUrlForIssuer = "https://moink.crevn.xyz/issue",
  onVerificationComplete,
  onError,
  className = "",
  text,
  style,
  children,
}) => {
  const {
    airService,
    isLoggedIn,
    currentEnv,
    partnerId: contextPartnerId,
    environmentConfig,
    isInitialized,
  } = useAppContext();

  // Use prop partnerId if provided, otherwise use context partnerId
  const activePartnerId = propPartnerId || contextPartnerId;

  console.log("VerifyButton props:", {
    partnerId: activePartnerId,
    verifierDid,
    apiKey,
    programId,
    redirectUrlForIssuer,
    onVerificationComplete,
  });

  // Widget state management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<AirCredentialWidget | null>(null);

  // Generate and launch widget
  const generateWidget = async () => {
    if (!airService) {
      const errorMsg =
        "AirService is not initialized. Please wait for initialization to complete.";
      setError(errorMsg);
      onError?.(errorMsg);
      setIsLoading(false);
      return;
    }

    if (!isLoggedIn) {
      const errorMsg = "Please login to AirService first.";
      setError(errorMsg);
      onError?.(errorMsg);
      setIsLoading(false);
      return;
    }

    try {
      console.log("Starting widget generation...");

      // Step 1: Fetch the verifier auth token using the API key
      const fetchedVerifierAuthToken = await getVerifierAuthToken(
        verifierDid,
        apiKey,
        environmentConfig.apiUrl
      );

      if (!fetchedVerifierAuthToken) {
        const errorMsg =
          "Failed to fetch verifier authentication token. Please check your API Key.";
        setError(errorMsg);
        onError?.(errorMsg);
        setIsLoading(false);
        return;
      }

      // Create the query request with the fetched token
      const queryRequest: QueryRequest = {
        process: "Verify",
        verifierAuth: fetchedVerifierAuthToken,
        programId: programId,
      };

      console.log("Getting URL with token from AirService...");
      const rp = await airService
        .goToPartner(environmentConfig.widgetUrl)
        .catch((err) => {
          console.error("Error getting URL with token:", err);
          throw err;
        });

      if (!rp?.urlWithToken) {
        const errorMsg =
          "Failed to get URL with token. Please check your partner ID.";
        console.warn(errorMsg);
        setError(errorMsg);
        onError?.(errorMsg);
        setIsLoading(false);
        return;
      }

      console.log("Creating widget with URL:", rp.urlWithToken);

      // Create and configure the widget with proper options
      widgetRef.current = new AirCredentialWidget(
        queryRequest,
        activePartnerId,
        {
          endpoint: rp.urlWithToken,
          airKitBuildEnv: currentEnv || BUILD_ENV.SANDBOX,
          theme: "light",
          locale: "en" as Language,
          redirectUrlForIssuer: redirectUrlForIssuer || undefined,
        }
      );

      // Set up event listeners
      widgetRef.current.on(
        "verifyCompleted",
        (results: VerificationResults) => {
          setIsLoading(false);
          console.log("Verification completed:", results);
          onVerificationComplete?.(results);
          setError(null);
        }
      );

      widgetRef.current.on("close", () => {
        setIsLoading(false);
        console.log("Widget closed");
      });

      console.log("Widget created successfully");
    } catch (err) {
      const errorMsg = `Widget generation error: ${
        err instanceof Error ? err.message : "Unknown error"
      }`;
      console.error(errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
      setIsLoading(false);
    }
  };

  const handleVerifyClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate widget if not already created
      if (!widgetRef.current) {
        await generateWidget();
      }

      // Start the widget
      if (widgetRef.current) {
        widgetRef.current.launch();
      }
    } catch (err) {
      const errorMsg = `Verification error: ${
        err instanceof Error ? err.message : "Unknown error"
      }`;
      setError(errorMsg);
      onError?.(errorMsg);
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Launching Verification...";
    if (!isInitialized) return "Initializing...";
    if (!isLoggedIn) return "Login Required";
    if (children) return children;
    if (text) return text;
    return "Verify Credential";
  };

  const isDisabled = () => {
    return isLoading || !isInitialized || !isLoggedIn;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy();
      }
    };
  }, []);

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
