"use client";
import { useState, useEffect, useRef } from "react";
import {
  AirCredentialWidget,
  type QueryRequest,
  type VerificationResults,
  type Language,
} from "@mocanetwork/air-credential-sdk";
import "@mocanetwork/air-credential-sdk/dist/style.css";
import {
  AirService,
  BUILD_ENV,
  type AirEventListener,
  type BUILD_ENV_TYPE,
} from "@mocanetwork/airkit";
import { usePartner } from "@/hooks/usePartner";
import { getEnvironmentConfig } from "@/config/environment";
import { useAccount } from "wagmi";
import { Navbar } from "@/components/Navbar";

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

export default function CredentialVerificationPage() {
  const { partnerId } = usePartner();
  const { isConnected } = useAccount();

  // AirService state management (following React pattern)
  const [airService, setAirService] = useState<AirService | null>(null);
  const [isAirServiceInitialized, setIsAirServiceInitialized] = useState(false);
  const [isAirServiceLoading, setIsAirServiceLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Widget state management
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<AirCredentialWidget | null>(null);

  // Get environment config based on current build environment
  const airKitBuildEnv: BUILD_ENV_TYPE = BUILD_ENV.SANDBOX; // You can make this configurable
  const environmentConfig = getEnvironmentConfig(airKitBuildEnv);

  // Configuration - these would typically come from environment variables or API
  const [config, setConfig] = useState({
    apiKey: process.env.NEXT_PUBLIC_VERIFIER_API_KEY || "your-verifier-api-key",
    verifierDid:
      process.env.NEXT_PUBLIC_VERIFIER_DID || "did:example:verifier123",
    programId: process.env.NEXT_PUBLIC_PROGRAM_ID || "c21hc030kb5iu0030224Qs",
    redirectUrlForIssuer:
      process.env.NEXT_PUBLIC_REDIRECT_URL_FOR_ISSUER ||
      "http://localhost:3000/issue",
  });

  // AirService initialization (following React pattern)
  const initializeAirService = async (partnerIdToUse: string = partnerId) => {
    if (!partnerIdToUse || partnerIdToUse === "your-partner-id") {
      console.warn("No valid Partner ID configured for verification");
      setIsAirServiceInitialized(true);
      return;
    }

    setIsAirServiceLoading(true);
    try {
      console.log("Initializing AirService with partnerId:", partnerIdToUse);

      const service = new AirService({ partnerId: partnerIdToUse });
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

      // Set up event listeners (following React pattern)
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
      console.error("Failed to initialize AirService:", err);
      setError(
        `Failed to initialize AirService: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setIsAirServiceInitialized(true); // Set to true to prevent infinite loading on error
    } finally {
      setIsAirServiceLoading(false);
    }
  };

  // Initialize AirService when partnerId changes
  useEffect(() => {
    if (partnerId) {
      initializeAirService(partnerId);
    }

    // Cleanup on unmount
    return () => {
      if (airService) {
        airService.cleanUp();
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
      console.error("AirService login failed:", err);
      setError(
        `Login failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsAirServiceLoading(false);
    }
  };

  // Handle AirService logout
  const handleAirServiceLogout = async () => {
    if (!airService) return;
    try {
      await airService.logout();
      setUserAddress(null);
    } catch (err) {
      console.error("AirService logout error:", err);
    }
  };

  console.log("AirService state:", {
    airService: !!airService,
    isAirServiceInitialized,
    isLoggedIn,
    userAddress,
    partnerId,
  });

  const handleConfigChange = (field: string, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const generateWidget = async () => {
    if (!airService) {
      setError(
        "AirService is not initialized. Please wait for initialization to complete."
      );
      setIsLoading(false);
      return;
    }

    try {
      console.log("Starting widget generation...");

      // Step 1: Fetch the verifier auth token using the API key
      const fetchedVerifierAuthToken = await getVerifierAuthToken(
        config.verifierDid,
        config.apiKey,
        environmentConfig.apiUrl
      );

      if (!fetchedVerifierAuthToken) {
        setError(
          "Failed to fetch verifier authentication token. Please check your API Key."
        );
        setIsLoading(false);
        return;
      }

      // Create the query request with the fetched token
      const queryRequest: QueryRequest = {
        process: "Verify",
        verifierAuth: fetchedVerifierAuthToken,
        programId: config.programId,
      };

      console.log("Getting URL with token from AirService...");
      const rp = await airService
        .goToPartner(environmentConfig.widgetUrl)
        .catch((err) => {
          console.error("Error getting URL with token:", err);
          throw err;
        });

      if (!rp?.urlWithToken) {
        console.warn(
          "Failed to get URL with token. Please check your partner ID."
        );
        setError("Failed to get URL with token. Please check your partner ID.");
        setIsLoading(false);
        return;
      }

      console.log("Creating widget with URL:", rp.urlWithToken);

      // Create and configure the widget with proper options
      widgetRef.current = new AirCredentialWidget(queryRequest, partnerId, {
        endpoint: rp.urlWithToken,
        airKitBuildEnv: airKitBuildEnv || BUILD_ENV.SANDBOX,
        theme: "light", // currently only have light theme
        redirectUrlForIssuer: config.redirectUrlForIssuer || undefined,
      });

      // Set up event listeners
      widgetRef.current.on(
        "verifyCompleted",
        (results: VerificationResults) => {
          setVerificationResult(results);
          setIsLoading(false);
          console.log("Verification completed:", results);
        }
      );

      widgetRef.current.on("close", () => {
        setIsLoading(false);
        console.log("Widget closed");
      });

      console.log("Widget created successfully");
    } catch (err) {
      console.error("Widget generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to create widget");
      setIsLoading(false);
    }
  };

  const handleVerifyCredential = async () => {
    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

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
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setVerificationResult(null);
    setError(null);
    if (widgetRef.current) {
      widgetRef.current.destroy();
      widgetRef.current = null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Compliant":
        return "text-green-800 bg-green-50 border-green-200";
      case "Non-Compliant":
        return "text-red-800 bg-red-50 border-red-200";
      case "Pending":
        return "text-yellow-800 bg-yellow-50 border-yellow-200";
      case "Revoking":
      case "Revoked":
        return "text-orange-800 bg-orange-50 border-orange-200";
      case "Expired":
        return "text-gray-800 bg-gray-50 border-gray-200";
      case "NotFound":
        return "text-purple-800 bg-purple-50 border-purple-200";
      default:
        return "text-gray-800 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Compliant":
        return "✅";
      case "Non-Compliant":
        return "❌";
      case "Pending":
        return "⏳";
      case "Revoking":
        return "🔄";
      case "Revoked":
        return "🚫";
      case "Expired":
        return "⏰";
      case "NotFound":
        return "🔍";
      default:
        return "❓";
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "Compliant":
        return "The credential is valid and meets all verification requirements.";
      case "Non-Compliant":
        return "The credential does not meet the verification requirements.";
      case "Pending":
        return "The credential is waiting for confirmation on the blockchain.";
      case "Revoking":
        return "The credential is currently being revoked.";
      case "Revoked":
        return "The credential has been revoked and is no longer valid.";
      case "Expired":
        return "The credential has expired and is no longer valid.";
      case "NotFound":
        return "No credential was found matching the verification criteria.";
      default:
        return "Unknown verification status.";
    }
  };

  useEffect(() => {
    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex-1 p-2 sm:p-4 lg:p-8">
        <div className="max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-2 sm:p-6 lg:p-8">
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-2 sm:mb-4">
              Credential Verification
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Verify digital credentials using the AIR Credential SDK. Configure
              the verification parameters below and Start the widget to begin
              the verification process.
            </p>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800">
                ⚠️ Please connect your wallet to use the verification feature.
              </p>
            </div>
          )}

          {/* AirService Status */}
          {isAirServiceLoading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-800"
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
                Initializing AirService...
              </p>
            </div>
          )}

          {isAirServiceInitialized && !isLoggedIn && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-yellow-800">
                  ⚠️ AirService initialized but not logged in. Please log in to
                  access verification features.
                </p>
                <button
                  onClick={handleAirServiceLogin}
                  disabled={isAirServiceLoading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isAirServiceLoading
                    ? "Logging in..."
                    : "Login to AirService"}
                </button>
              </div>
            </div>
          )}

          {isAirServiceInitialized && isLoggedIn && userAddress && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-green-800 font-medium">
                    ✅ AirService connected successfully!
                  </p>
                  <p className="text-green-700 text-sm">
                    Address: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </p>
                </div>
                <button
                  onClick={handleAirServiceLogout}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {!isAirServiceInitialized && isConnected && !isAirServiceLoading && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">
                ❌ Failed to initialize AirService. Please check the console for
                errors.
              </p>
            </div>
          )}

          {/* Configuration Section */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">
              Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verifier DID
                </label>
                <input
                  type="text"
                  value={config.verifierDid}
                  onChange={(e) =>
                    handleConfigChange("verifierDid", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your verifier DID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verifier API Key
                </label>
                <input
                  type="text"
                  value={config.apiKey}
                  onChange={(e) => handleConfigChange("apiKey", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your verifier API key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program ID
                </label>
                <input
                  type="text"
                  value={config.programId}
                  onChange={(e) =>
                    handleConfigChange("programId", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="program-123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner ID (from Context)
                </label>
                <input
                  type="text"
                  value={partnerId}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Partner ID from Context"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redirect URL for Issuer
                </label>
                <input
                  type="url"
                  value={config.redirectUrlForIssuer}
                  onChange={(e) =>
                    handleConfigChange("redirectUrlForIssuer", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/issue-credential"
                />
              </div>
            </div>
          </div>

          {/* Environment Info */}
          <div className="mb-6 sm:mb-8 p-2 sm:p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">
              Environment Configuration:
            </h4>
            <div className="text-xs text-gray-700 space-y-1">
              <p>
                <strong>Widget URL:</strong> {environmentConfig.widgetUrl}
              </p>
              <p>
                <strong>API URL:</strong> {environmentConfig.apiUrl}
              </p>
              <p>
                <strong>Theme:</strong> light
              </p>
              <p>
                <strong>Build Environment:</strong> {airKitBuildEnv}
              </p>
              <p>
                <strong>AirService Status:</strong>{" "}
                {isAirServiceLoading ? (
                  <span className="text-blue-600">Initializing...</span>
                ) : isAirServiceInitialized ? (
                  <span className="text-green-600">Initialized</span>
                ) : (
                  <span className="text-red-600">Not Initialized</span>
                )}
              </p>
              <p>
                <strong>AirService Login:</strong>{" "}
                {isLoggedIn ? (
                  <span className="text-green-600">Logged In</span>
                ) : (
                  <span className="text-orange-600">Not Logged In</span>
                )}
              </p>
              <p>
                <strong>Wallet:</strong>{" "}
                {isConnected ? (
                  <span className="text-green-600">Connected</span>
                ) : (
                  <span className="text-red-600">Not Connected</span>
                )}
              </p>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-4 sm:mb-6 p-2 sm:p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-xs sm:text-base">{error}</p>
            </div>
          )}

          {/* Verification Results */}
          {verificationResult && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">
                Verification Results
              </h3>
              <div className="p-2 sm:p-4 border rounded-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                    Verification Result
                  </h4>
                  <span
                    className={`mt-2 sm:mt-0 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                      verificationResult.status
                    )}`}
                  >
                    {getStatusIcon(verificationResult.status)}{" "}
                    {verificationResult.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  {getStatusDescription(verificationResult.status)}
                </p>
                <pre className="text-xs text-gray-500 bg-gray-50 p-2 rounded overflow-auto">
                  {JSON.stringify(verificationResult, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleVerifyCredential}
              disabled={
                isLoading ||
                !isConnected ||
                !isAirServiceInitialized ||
                !isLoggedIn
              }
              className="w-full sm:flex-1 bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Launching Widget...
                </span>
              ) : (
                "Start Credential Verification Widget"
              )}
            </button>

            {verificationResult && (
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 border border-blue-300 text-blue-700 rounded-md font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 sm:mt-8 p-2 sm:p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-1 sm:mb-2">
              Instructions:
            </h4>
            <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
              <li>• Connect your wallet using the navigation bar</li>
              <li>
                • Wait for AirService to initialize (should happen
                automatically)
              </li>
              <li>
                • Login to AirService using the login button if not already
                logged in
              </li>
              <li>• Need to whitelist the cross partner domain in Airkit </li>
              <li>• Configure the verifier API key and program ID</li>
              <li>• Set the partner id</li>
              <li>• Set the redirect URL for issuer if required</li>
              <li>
                • Click "Start Credential Verification Widget" to start the
                process
              </li>
              <li>• The widget will handle the credential verification flow</li>
              <li>• Review the verification results after completion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
