"use client";

import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { getAuthToken } from "@/lib/airkit-auth";
import Layout from "@/components/Layout";

interface VerificationResultData {
  status: string;
  zkProofs?: Record<string, string>;
  transactionHash?: string;
}

const CredentialVerification = () => {
  const { airService, isLoggedIn, partnerId } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [config, setConfig] = useState({
    programId: process.env.NEXT_PUBLIC_PROGRAM_ID || "",
    redirectUrlForIssuer:
      process.env.NEXT_PUBLIC_REDIRECT_URL_FOR_ISSUER ||
      "http://localhost:3000/issue",
  });

  const handleConfigChange = (field: string, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleVerifyCredential = async () => {
    if (!airService) {
      setError("AirService is not initialized. Please wait.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const jwt = await getAuthToken("verify");

      const result = await airService.verifyCredential({
        authToken: jwt,
        programId: config.programId,
        redirectUrl: config.redirectUrlForIssuer || undefined,
      });

      console.log("Verification result:", result);
      setVerificationResult(result.verificationResult);
    } catch (err) {
      console.error("Verification error:", err);
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setVerificationResult(null);
    setError(null);
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

  return (
    <Layout>
      <div className="flex-1 p-2 sm:p-4 lg:p-8">
        <div className="max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-2 sm:p-6 lg:p-8">
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-2 sm:mb-4">
              Credential Verification
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Verify digital credentials using the AIR Kit SDK. Configure the
              verification parameters below and verify credentials directly.
            </p>
          </div>

          {!isLoggedIn && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800">
                Please connect your wallet to use the verification feature.
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
                  Program ID
                </label>
                <input
                  type="text"
                  value={config.programId}
                  onChange={(e) =>
                    handleConfigChange("programId", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Verification program ID"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/issue"
                />
              </div>
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
                    {verificationResult.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  {getStatusDescription(verificationResult.status)}
                </p>
                {verificationResult.transactionHash && (
                  <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-xs text-green-600 mb-1">
                      Transaction Hash:
                    </p>
                    <code className="text-xs font-mono text-green-800 break-all">
                      {verificationResult.transactionHash}
                    </code>
                  </div>
                )}
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-sm">
                    View Full Results
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 text-sm overflow-auto">
                    {JSON.stringify(verificationResult, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleVerifyCredential}
              disabled={isLoading || !isLoggedIn}
              className="w-full sm:flex-1 bg-purple-600 text-white px-4 sm:px-6 py-3 rounded-md font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  Verifying...
                </span>
              ) : (
                "Verify Credential"
              )}
            </button>

            {verificationResult && (
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 border border-purple-300 text-purple-700 rounded-md font-medium hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
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
              <li>1. Connect your wallet using the login button</li>
              <li>2. Ensure your domain is whitelisted in the AIRKit dashboard</li>
              <li>3. Configure the program ID for your verification program</li>
              <li>4. Click Verify Credential to verify directly via the SDK</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CredentialVerification;
