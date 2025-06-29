"use client";

import { useState, useEffect, useRef } from "react";
import {
  AirCredentialWidget,
  type ClaimRequest,
  type JsonDocumentObject,
  type Language,
} from "@mocanetwork/air-credential-sdk";
import "@mocanetwork/air-credential-sdk/dist/style.css";
import { BUILD_ENV } from "@mocanetwork/airkit";
import { useAppContext } from "@/contexts/AppContext";
import Layout from "@/components/Layout";

// Environment variables for configuration
const LOCALE = process.env.NEXT_PUBLIC_LOCALE || "en";

interface CredentialField {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "date";
  value: string | number | boolean;
}

const getIssuerAuthToken = async (
  issuerDid: string,
  apiKey: string,
  apiUrl: string
): Promise<string | null> => {
  try {
    const response = await fetch(`${apiUrl}/issuer/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        "X-Test": "true",
      },
      body: JSON.stringify({
        issuerDid: issuerDid,
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
        "Failed to get issuer auth token from API:",
        data.msg || "Unknown error"
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching issuer auth token:", error);
    return null;
  }
};

export default function CredentialIssuancePage() {
  const {
    airService,
    isInitialized,
    isLoggedIn,
    partnerId,
    currentEnv,
    environmentConfig,
  } = useAppContext();

  // Widget state management
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<AirCredentialWidget | null>(null);

  // Configuration - these would typically come from environment variables
  const [config, setConfig] = useState({
    issuerDid: process.env.NEXT_PUBLIC_ISSUER_DID!,
    apiKey: process.env.NEXT_PUBLIC_ISSUER_API_KEY!,
    credentialId: process.env.NEXT_PUBLIC_CREDENTIAL_ID!,
  });

  // Dynamic credential subject fields
  const [credentialFields, setCredentialFields] = useState<CredentialField[]>([
    {
      id: "1",
      name: "age",
      type: "number",
      value: 20,
    },
  ]);

  const handleConfigChange = (field: string, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const addCredentialField = () => {
    const newField: CredentialField = {
      id: Date.now().toString(),
      name: "",
      type: "string",
      value: "",
    };
    setCredentialFields([...credentialFields, newField]);
  };

  const updateCredentialField = (
    id: string,
    field: Partial<CredentialField>
  ) => {
    setCredentialFields(
      credentialFields.map((f) => (f.id === id ? { ...f, ...field } : f))
    );
  };

  const removeCredentialField = (id: string) => {
    setCredentialFields(credentialFields.filter((f) => f.id !== id));
  };

  const convertFieldsToCredentialSubject = (): JsonDocumentObject => {
    const subject: JsonDocumentObject = {};
    credentialFields.forEach((field) => {
      if (field.name.trim()) {
        let value: string | number | boolean = field.value;

        // Convert value based on type
        switch (field.type) {
          case "number":
            value =
              typeof field.value === "string"
                ? parseFloat(field.value) || 0
                : field.value;
            break;
          case "boolean":
            value =
              typeof field.value === "string"
                ? field.value === "true"
                : field.value;
            break;
          case "date":
            if (typeof field.value === "string") {
              // Convert date string to YYYYMMDD format
              const date = new Date(field.value);
              if (!isNaN(date.getTime())) {
                value = parseInt(
                  date.getFullYear().toString() +
                    (date.getMonth() + 1).toString().padStart(2, "0") +
                    date.getDate().toString().padStart(2, "0")
                );
              }
            }
            break;
          default:
            value = field.value;
        }

        subject[field.name] = value;
      }
    });
    return subject;
  };

  const generateWidget = async () => {
    try {
      // Step 1: Fetch the issuer auth token using the API key
      const fetchedIssuerAuthToken = await getIssuerAuthToken(
        config.issuerDid,
        config.apiKey,
        environmentConfig.apiUrl
      );

      if (!fetchedIssuerAuthToken) {
        setError(
          "Failed to fetch issuer authentication token. Please check your DID and API Key."
        );
        setIsLoading(false);
        return;
      }

      const credentialSubject = convertFieldsToCredentialSubject();

      console.log("credentialSubject", credentialSubject);

      // Create the claim request with the fetched token
      const claimRequest: ClaimRequest = {
        process: "Issue",
        issuerDid: config.issuerDid,
        issuerAuth: fetchedIssuerAuthToken,
        credentialId: config.credentialId,
        credentialSubject: credentialSubject,
      };

      if (!airService) {
        setError(
          "AirService is not initialized. Please wait for initialization to complete."
        );
        setIsLoading(false);
        return;
      }

      console.log("Getting URL with token from AirService...");
      const rp = await airService
        .goToPartner(environmentConfig.widgetUrl)
        .catch((err) => {
          console.error("Error getting URL with token:", err);
          throw err;
        });

      console.log("urlWithToken", rp, rp?.urlWithToken);

      if (!rp?.urlWithToken) {
        console.warn(
          "Failed to get URL with token. Please check your partner ID."
        );
        setError("Failed to get URL with token. Please check your partner ID.");
        setIsLoading(false);
        return;
      }

      // Create and configure the widget with proper options
      widgetRef.current = new AirCredentialWidget(claimRequest, partnerId, {
        endpoint: rp?.urlWithToken,
        airKitBuildEnv: currentEnv || BUILD_ENV.SANDBOX,
        theme: "light", // currently only have light theme
        locale: LOCALE as Language,
      });

      // Set up event listeners
      widgetRef.current.on("issueCompleted", () => {
        setIsSuccess(true);
        setIsLoading(false);
        console.log("Credential issuance completed successfully!");
      });

      widgetRef.current.on("close", () => {
        setIsLoading(false);
        console.log("Widget closed");
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create widget");
      setIsLoading(false);
    }
  };

  const handleIssueCredential = async () => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

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
    setIsSuccess(false);
    setError(null);
    if (widgetRef.current) {
      widgetRef.current.destroy();
      widgetRef.current = null;
    }
  };

  const renderFieldValueInput = (field: CredentialField) => {
    switch (field.type) {
      case "boolean":
        return (
          <select
            value={field.value.toString()}
            onChange={(e) =>
              updateCredentialField(field.id, {
                value: e.target.value === "true",
              })
            }
            className="w-full h-[42px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      case "number":
        return (
          <input
            type="number"
            value={field.value.toString()}
            onChange={(e) =>
              updateCredentialField(field.id, {
                value: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter number"
          />
        );
      case "date":
        return (
          <input
            type="date"
            value={
              typeof field.value === "string"
                ? field.value
                : new Date().toISOString().split("T")[0]
            }
            onChange={(e) =>
              updateCredentialField(field.id, { value: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      default:
        return (
          <input
            type="text"
            value={field.value.toString()}
            onChange={(e) =>
              updateCredentialField(field.id, { value: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter value"
          />
        );
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
    <Layout>
      <div className="flex-1 p-2 sm:p-4 lg:p-8">
        <div className="max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-2 sm:p-6 lg:p-8">
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-2 sm:mb-4">
              Credential Issuance
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Issue digital credentials using the AIR Credential SDK. Configure
              the issuance parameters below and start the widget to begin the
              credential issuance process.
            </p>
          </div>

          {/* Connection Status */}
          {!isLoggedIn && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800">
                ⚠️ Please connect your wallet to use the issuance feature.
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
                  Issuer DID
                </label>
                <input
                  type="text"
                  value={config.issuerDid}
                  onChange={(e) =>
                    handleConfigChange("issuerDid", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your issuer DID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issuer API Key
                </label>
                <input
                  type="text"
                  value={config.apiKey}
                  onChange={(e) => handleConfigChange("apiKey", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your issuer API key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credential ID
                </label>
                <input
                  type="text"
                  value={config.credentialId}
                  onChange={(e) =>
                    handleConfigChange("credentialId", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your credential ID"
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
            </div>
          </div>

          {/* Credential Subject Fields */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-4 gap-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Credential Subject Fields
              </h3>
              <button
                onClick={addCredentialField}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Add Field
              </button>
            </div>

            {credentialFields.length > 0 && (
              <div className="space-y-4">
                {credentialFields.map((field) => (
                  <div
                    key={field.id}
                    className="p-2 sm:p-4 border border-gray-200 rounded-md bg-gray-50"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Field Name
                        </label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) =>
                            updateCredentialField(field.id, {
                              name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., name, email, age"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateCredentialField(field.id, {
                              type: e.target.value as
                                | "string"
                                | "number"
                                | "boolean"
                                | "date",
                            })
                          }
                          className="w-full h-[42px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="date">Date</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Value
                        </label>
                        {renderFieldValueInput(field)}
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeCredentialField(field.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          title="Remove field"
                        >
                          <svg
                            className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                <strong>Locale:</strong> {LOCALE}
              </p>
              <p>
                <strong>AirService:</strong>{" "}
                {isInitialized && isLoggedIn ? (
                  <span className="text-green-600">Connected</span>
                ) : (
                  <span className="text-orange-600">Not Connected</span>
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

          {isSuccess && (
            <div className="mb-4 sm:mb-6 p-2 sm:p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-xs sm:text-base">
                ✅ Credential issuance completed successfully!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleIssueCredential}
              disabled={isLoading || !isInitialized || !isLoggedIn}
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
                "Start Credential Issuance Widget"
              )}
            </button>

            {isSuccess && (
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
              <li>• Need to connect your wallet using the login button</li>
              <li>• Need to whitelist the cross partner domain in Airkit</li>
              <li>• Configure the issuer DID, API key, and credential ID</li>
              <li>
                • Add credential subject fields using the Add Field button
              </li>
              <li>
                • Set field name, type (string, number, boolean, date), and
                value
              </li>
              <li>
                • Click Start Credential Issuance Widget to start the process
              </li>
              <li>• The widget will handle the credential issuance flow</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
