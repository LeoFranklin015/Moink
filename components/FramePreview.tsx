"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share,
  MoreHorizontal,
} from "lucide-react";

export interface FrameConfig {
  logo: string;
  backgroundColor: string;
  title: string;
  description: string;
  credentialId: string;
  verificationRequirement: string;
  buttonText: string;
  buttonColor: string;
  buttonHoverColor: string;
  contractAddress: string;
  abi: string;
  functionName: string;
}

interface FramePreviewProps {
  config: FrameConfig;
}

interface FunctionInput {
  name: string;
  type: string;
  internalType?: string;
}

interface AbiFunction {
  name: string;
  type: string;
  inputs: FunctionInput[];
  stateMutability?: string;
}

export function FramePreview({ config }: FramePreviewProps) {
  const [showInputs, setShowInputs] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [functionInputs, setFunctionInputs] = useState<FunctionInput[]>([]);
  const [error, setError] = useState<string>("");

  const parseAbiAndFindFunction = (): FunctionInput[] | null => {
    try {
      if (!config.abi || !config.functionName) {
        setError("ABI or function name not provided");
        return null;
      }

      const parsedAbi = JSON.parse(config.abi) as AbiFunction[];
      const targetFunction = parsedAbi.find(
        (item) => item.type === "function" && item.name === config.functionName
      );

      if (!targetFunction) {
        setError(`Function "${config.functionName}" not found in ABI`);
        return null;
      }

      setError("");
      return targetFunction.inputs || [];
    } catch (err) {
      setError("Invalid ABI format");
      return null;
    }
  };

  const handleButtonClick = () => {
    if (!showInputs) {
      const inputs = parseAbiAndFindFunction();
      if (inputs) {
        setFunctionInputs(inputs);
        // Initialize input values
        const initialValues: Record<string, string> = {};
        inputs.forEach((input) => {
          initialValues[input.name] = "";
        });
        setInputValues(initialValues);
        setShowInputs(true);
      }
    } else {
      // Handle form submission
      console.log("Submitting with values:", inputValues);
      // Here you would typically call the smart contract function
      setShowInputs(false);
    }
  };

  const handleInputChange = (paramName: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const handleBack = () => {
    setShowInputs(false);
    setError("");
  };

  const getInputPlaceholder = (type: string) => {
    if (type.includes("address")) return "0x...";
    if (type.includes("uint")) return "0";
    if (type.includes("string")) return "Enter text";
    if (type.includes("bool")) return "true/false";
    return `${type} value`;
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Twitter Post Container */}
      <div className="bg-black border border-white rounded-2xl overflow-hidden">
        {/* Twitter Header */}
        <div className="p-4 flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">M</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold text-sm">Moink</span>
              <span className="text-white/50 text-sm">@moink_app</span>
              <span className="text-white/30">·</span>
              <span className="text-white/50 text-sm">2m</span>
            </div>
            <p className="text-white/90 text-sm mt-1 leading-relaxed">
              New frame is live! Verify your credentials directly in your
              Twitter feed 🚀
            </p>
          </div>
          <button className="text-white/50 hover:text-white/70 p-1">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Frame Content */}
        <div className="mx-4 mb-4">
          <div
            className="rounded-xl overflow-hidden border border-white/[0.08] min-h-[400px]"
            style={{ backgroundColor: config.backgroundColor }}
          >
            <div className="p-8">
              {/* Logo */}
              {config.logo ? (
                <img
                  src={config.logo || "/placeholder.svg"}
                  alt="Logo"
                  className="h-28 w-28 object-cover mx-auto mb-6 rounded-full border-2 border-white/20"
                />
              ) : (
                <div className="h-28 w-28 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-white/20">
                  <span className="text-white/50 text-xs">Logo</span>
                </div>
              )}

              {/* Title */}
              <h3 className="text-white font-semibold text-xl mb-4 text-center">
                {config.title || "Frame Title"}
              </h3>

              {/* Description */}
              <p className="text-white/80 text-base mb-8 leading-relaxed text-center max-w-md mx-auto">
                {config.description || "Frame description"}
              </p>

              {/* Verification Badge */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-8 text-left max-w-md mx-auto">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-md flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">
                      Verification Required
                    </div>
                    <div className="text-white/60 text-sm">
                      {config.verificationRequirement}
                    </div>
                  </div>
                </div>
              </div>

              {!showInputs ? (
                // Initial Action Button
                <div className="text-center">
                  <button
                    onClick={handleButtonClick}
                    className="w-full max-w-md mx-auto text-white font-medium py-4 px-6 rounded-lg transition-colors text-base hover:opacity-90"
                    style={{
                      backgroundColor: config.buttonColor,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        config.buttonHoverColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        config.buttonColor;
                    }}
                  >
                    {config.buttonText || "Action Button"}
                  </button>

                  {/* Error Display */}
                  {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm max-w-md mx-auto">
                      {error}
                    </div>
                  )}
                </div>
              ) : (
                // Function Inputs Section
                <div className="max-w-md mx-auto">
                  {/* Function Inputs */}
                  <div className="space-y-4 mb-6">
                    {functionInputs.map((input, index) => (
                      <div key={index}>
                        <label className="block text-white/70 text-sm mb-2">
                          {input.name}
                          <span className="text-white/50 ml-1">
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
                          className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/10"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleBack}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-4 px-6 rounded-lg transition-colors text-base"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleButtonClick}
                      disabled={functionInputs.some(
                        (input) => !inputValues[input.name]?.trim()
                      )}
                      className="flex-[2] text-white font-medium py-4 px-6 rounded-lg transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                      style={{
                        backgroundColor: functionInputs.some(
                          (input) => !inputValues[input.name]?.trim()
                        )
                          ? "#666"
                          : config.buttonColor,
                      }}
                      onMouseEnter={(e) => {
                        if (
                          !functionInputs.some(
                            (input) => !inputValues[input.name]?.trim()
                          )
                        ) {
                          e.currentTarget.style.backgroundColor =
                            config.buttonHoverColor;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (
                          !functionInputs.some(
                            (input) => !inputValues[input.name]?.trim()
                          )
                        ) {
                          e.currentTarget.style.backgroundColor =
                            config.buttonColor;
                        }
                      }}
                    >
                      Execute {config.functionName}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Frame Footer */}
          <div className="mt-3 flex items-center justify-between text-xs text-white/40">
            <span>From moink.vercel.app</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Live</span>
            </div>
          </div>
        </div>

        {/* Twitter Actions */}
        <div className="px-4 pb-3 flex items-center justify-between text-white/50">
          <button className="flex items-center space-x-2 hover:text-white/70 transition-colors">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">12</span>
          </button>
          <button className="flex items-center space-x-2 hover:text-white/70 transition-colors">
            <Repeat2 className="h-4 w-4" />
            <span className="text-xs">8</span>
          </button>
          <button className="flex items-center space-x-2 hover:text-white/70 transition-colors">
            <Heart className="h-4 w-4" />
            <span className="text-xs">24</span>
          </button>
          <button className="flex items-center space-x-2 hover:text-white/70 transition-colors">
            <Bookmark className="h-4 w-4" />
          </button>
          <button className="flex items-center space-x-2 hover:text-white/70 transition-colors">
            <Share className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview Info */}
      <div className="mt-4 text-center">
        <p className="text-white/40 text-xs">
          Live preview • Updates in real-time
        </p>
      </div>
    </div>
  );
}
