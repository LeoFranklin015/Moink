"use client";
import { useState, useEffect, useRef } from "react";
import {
  AirCredentialWidget,
  type QueryRequest,
  type VerificationResults,
} from "@mocanetwork/air-credential-sdk";
import "@mocanetwork/air-credential-sdk/dist/style.css";
import {
  AirService,
  BUILD_ENV,
  type AirEventListener,
  type BUILD_ENV_TYPE,
} from "@mocanetwork/airkit";
import { getEnvironmentConfig } from "@/config/environment";

interface VerifyButtonProps {
  partnerId: string;
  verifierDid?: string;
  apiKey?: string;
  programId?: string;
  redirectUrlForIssuer?: string;
  onVerificationComplete?: (results: VerificationResults) => void;
  onError?: (error: string) => void;
  className?: string;
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
  partnerId,
  verifierDid = process.env.NEXT_PUBLIC_VERIFIER_DID ||
    "did:example:verifier123",
  apiKey = process.env.NEXT_PUBLIC_VERIFIER_API_KEY || "your-verifier-api-key",
  programId = process.env.NEXT_PUBLIC_PROGRAM_ID || "c21hg030taxui0091199Ic",
  redirectUrlForIssuer = "https://moink.crevn.xyz/issue",
  onVerificationComplete,
  onError,
  className = "",
  children,
}) => {
  console.log("VerifyButton props:", {
    partnerId,
    verifierDid,
    apiKey,
    programId,
    redirectUrlForIssuer,
    onVerificationComplete,
  });

  // AirService state management
  const [airService, setAirService] = useState<AirService | null>(null);
  const [isAirServiceInitialized, setIsAirServiceInitialized] = useState(false);
  const [isAirServiceLoading, setIsAirServiceLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Widget state management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<AirCredentialWidget | null>(null);

  // Environment configuration
  const airKitBuildEnv: BUILD_ENV_TYPE = BUILD_ENV.SANDBOX;
  const environmentConfig = getEnvironmentConfig(airKitBuildEnv);

  // AirService initialization
  const initializeAirService = async () => {
    if (!partnerId || partnerId === "your-partner-id") {
      const errorMsg = "No valid Partner ID provided for verification";
      console.warn(errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
      setIsAirServiceInitialized(true);
      return;
    }

    setIsAirServiceLoading(true);
    try {
      console.log("Initializing AirService with partnerId:", partnerId);

      const service = new AirService({ partnerId });
      await service.init({
        buildEnv: airKitBuildEnv,
        enableLogging: true,
        skipRehydration: false,
      });

      setAirService(service);
      setIsAirServiceInitialized(true);
      setIsLoggedIn(service.isLoggedIn);

      if (service.isLoggedIn && service.loginResult) {
        const result = service.loginResult;
        console.log("Login result from initialized service:", result);
        if (result.abstractAccountAddress) {
          setUserAddress(result.abstractAccountAddress || null);
        } else {
          console.log("No abstractAccountAddress, trying eth_accounts");
          const accounts = await service?.provider.request({
            method: "eth_accounts",
            params: [],
          });
          console.log("eth_accounts result:", accounts);
          setUserAddress(
            Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null
          );
        }
      }

      // Set up event listeners
      const eventListener: AirEventListener = async (data) => {
        console.log("AirService event:", data);
        if (data.event === "logged_in") {
          setIsLoggedIn(true);
          if (data.result.abstractAccountAddress) {
            setUserAddress(data.result.abstractAccountAddress || null);
          } else {
            const accounts = await service?.provider.request({
              method: "eth_accounts",
              params: [],
            });
            setUserAddress(
              Array.isArray(accounts) && accounts.length > 0
                ? accounts[0]
                : null
            );
          }
        } else if (data.event === "logged_out") {
          setIsLoggedIn(false);
          setUserAddress(null);
        }
      };
      service.on(eventListener);

      console.log("AirService initialized successfully");
    } catch (err) {
      const errorMsg = `Failed to initialize AirService: ${
        err instanceof Error ? err.message : "Unknown error"
      }`;
      console.error(errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
      setIsAirServiceInitialized(true);
    } finally {
      setIsAirServiceLoading(false);
    }
  };

  // Initialize AirService when partnerId changes
  useEffect(() => {
    if (partnerId) {
      initializeAirService();
    }

    // Cleanup on unmount
    return () => {
      if (airService) {
        airService.cleanUp();
      }
      if (widgetRef.current) {
        widgetRef.current.destroy();
      }
    };
  }, [partnerId]);

  // Handle AirService login
  const handleAirServiceLogin = async () => {
    if (!airService) return;
    setIsAirServiceLoading(true);
    try {
      const loginResult = await airService.login();
      console.log("Login result:", loginResult);

      if (loginResult.abstractAccountAddress) {
        setUserAddress(loginResult.abstractAccountAddress || null);
      } else {
        const accounts = await airService?.provider.request({
          method: "eth_accounts",
          params: [],
        });
        setUserAddress(
          Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null
        );
      }
    } catch (err) {
      const errorMsg = `Login failed: ${
        err instanceof Error ? err.message : "Unknown error"
      }`;
      console.error(errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsAirServiceLoading(false);
    }
  };

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
      setError(null);

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
      widgetRef.current = new AirCredentialWidget(queryRequest, partnerId, {
        endpoint: rp.urlWithToken,
        airKitBuildEnv: airKitBuildEnv || BUILD_ENV.SANDBOX,
        theme: "light",
        redirectUrlForIssuer: redirectUrlForIssuer || undefined,
      });

      // Set up event listeners
      widgetRef.current.on(
        "verifyCompleted",
        (results: VerificationResults) => {
          setIsLoading(false);
          console.log("Verification completed:", results);
          onVerificationComplete?.(results);
        }
      );

      widgetRef.current.on("close", () => {
        setIsLoading(false);
        console.log("Widget closed");
      });

      // Launch the widget
      widgetRef.current.launch();
      console.log("Widget launched successfully");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to create widget";
      console.error("Widget generation error:", err);
      setError(errorMsg);
      onError?.(errorMsg);
      setIsLoading(false);
    }
  };

  const handleVerifyClick = async () => {
    if (!isAirServiceInitialized) {
      const errorMsg = "AirService is still initializing. Please wait.";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (!isLoggedIn) {
      // Try to login first
      await handleAirServiceLogin();
      return;
    }

    setIsLoading(true);
    await generateWidget();
  };

  // Determine button text and state
  const getButtonText = () => {
    if (isAirServiceLoading) return "Initializing...";
    if (isLoading) return "Launching Widget...";
    if (!isAirServiceInitialized) return "Service Not Ready";
    if (!isLoggedIn) return "Login & Verify";
    return "Verify Credential";
  };

  const isDisabled =
    isAirServiceLoading ||
    isLoading ||
    (!isAirServiceInitialized && !isAirServiceLoading);

  return (
    <div className="space-y-2">
      <button
        onClick={handleVerifyClick}
        disabled={isDisabled}
        className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
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
        {children || getButtonText()}
      </button>

      {/* Status indicators */}
      {isAirServiceInitialized && isLoggedIn && userAddress && (
        <div className="text-xs text-green-600">
          ✅ Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
        </div>
      )}

      {error && <div className="text-xs text-red-600 max-w-md">❌ {error}</div>}
    </div>
  );
};
