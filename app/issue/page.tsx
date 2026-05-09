"use client";

import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { getAuthToken } from "@/lib/airkit-auth";
import Layout from "@/components/Layout";

interface CredentialField {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "date";
  value: string | number | boolean;
}

export default function CredentialIssuancePage() {
  const { airService, isInitialized, isLoggedIn, partnerId } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [config, setConfig] = useState({
    issuerDid: process.env.NEXT_PUBLIC_ISSUER_DID || "",
    credentialId: process.env.NEXT_PUBLIC_CREDENTIAL_ID || "",
  });

  const [credentialFields, setCredentialFields] = useState<CredentialField[]>([
    { id: "1", name: "age", type: "number", value: 20 },
  ]);

  const handleConfigChange = (field: string, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const addCredentialField = () => {
    setCredentialFields([
      ...credentialFields,
      { id: Date.now().toString(), name: "", type: "string", value: "" },
    ]);
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

  const convertFieldsToCredentialSubject = (): Record<string, unknown> => {
    const subject: Record<string, unknown> = {};
    credentialFields.forEach((field) => {
      if (field.name.trim()) {
        let value: string | number | boolean = field.value;
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

  const handleIssueCredential = async () => {
    if (!airService) {
      setError("AirService is not initialized. Please wait.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log("[1] Fetching JWT...");
      const jwt = await getAuthToken("issue");
      console.log("[2] JWT received:", jwt.substring(0, 30) + "...");

      const credentialSubject = convertFieldsToCredentialSubject();
      console.log("[3] Credential subject:", credentialSubject);
      console.log("[4] Config:", { issuerDid: config.issuerDid, credentialId: config.credentialId });

      console.log("[5] Calling airService.issueCredential()...");
      const result = await airService.issueCredential({
        authToken: jwt,
        issuerDid: config.issuerDid,
        credentialId: config.credentialId,
        credentialSubject,
      });

      console.log("[6] Credential issued successfully:", result);
      setIsSuccess(true);
    } catch (err) {
      console.error("[ERROR] Issuance failed:", err);
      setError(err instanceof Error ? err.message : "Credential issuance failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setError(null);
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

  return (
    <Layout>
      <div className="flex-1 p-2 sm:p-4 lg:p-8">
        <div className="max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-2 sm:p-6 lg:p-8">
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-2 sm:mb-4">
              Credential Issuance
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Issue digital credentials using the AIR Kit SDK. Configure the
              issuance parameters below and issue credentials directly.
            </p>
          </div>

          {!isLoggedIn && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800">
                Please connect your wallet to use the issuance feature.
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
                  Credential ID (Program)
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AirService
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {isInitialized && isLoggedIn ? (
                    <span className="text-green-600 text-sm">Connected</span>
                  ) : (
                    <span className="text-orange-600 text-sm">
                      Not Connected
                    </span>
                  )}
                </div>
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

          {/* Status Messages */}
          {error && (
            <div className="mb-4 sm:mb-6 p-2 sm:p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-xs sm:text-base">{error}</p>
            </div>
          )}

          {isSuccess && (
            <div className="mb-4 sm:mb-6 p-2 sm:p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-xs sm:text-base">
                Credential issuance completed successfully!
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
                  Issuing Credential...
                </span>
              ) : (
                "Issue Credential"
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
              <li>1. Connect your wallet using the login button</li>
              <li>2. Ensure your domain is whitelisted in the AIRKit dashboard</li>
              <li>3. Add credential subject fields (name, type, value)</li>
              <li>4. Click Issue Credential to issue directly via the SDK</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
