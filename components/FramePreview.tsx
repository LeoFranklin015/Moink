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
  backgroundImage: string;
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
              <span className="text-white/50 text-sm">Sponsored</span>
            </div>
            <p className="text-white/90 text-sm mt-1 leading-relaxed">
              🔥 Exclusive opportunity! Limited time access to premium features
            </p>
          </div>
          <button className="text-white/50 hover:text-white/70 p-1">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Frame Content */}
        <div className="mx-4 mb-4">
          <div
            className="rounded-xl overflow-hidden border border-white/[0.08] min-h-[400px] relative"
            style={{ backgroundColor: config.backgroundColor }}
          >
            {/* Blurred background layer for images that don't fit */}
            {config.backgroundImage && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${config.backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  filter: "blur(20px)",
                  transform: "scale(1.1)",
                }}
              ></div>
            )}

            {/* Main background image */}
            {config.backgroundImage && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${config.backgroundImage})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              ></div>
            )}

            {/* Gradient Overlay for Text Visibility */}
            <div className="absolute inset-0">
              {/* Gradient overlay from dark left to transparent right */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            </div>

            <div className="relative z-10 p-8 h-full flex flex-col">
              {/* Top Section: Logo positioned top right (only if provided) */}
              <div className="flex justify-end mb-6">
                {config.logo && (
                  <img
                    src={config.logo}
                    alt="Logo"
                    className="h-20 w-20 object-cover rounded-full border-3 border-white/40 shadow-lg"
                  />
                )}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col justify-between">
                {/* Left Side Content over overlay */}
                <div className="max-w-md">
                  {/* Title */}
                  <h3
                    className="text-white font-bold text-3xl mb-4 leading-tight"
                    style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.9)" }}
                  >
                    {config.title || "Frame Title"}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-white/95 text-lg mb-6 leading-relaxed font-medium"
                    style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}
                  >
                    {config.description || "Frame description"}
                  </p>

                  {/* Verification Info */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full shadow-sm"></div>
                      <span
                        className="text-white/90 text-sm font-semibold"
                        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                      >
                        Verification Required
                      </span>
                    </div>
                    <div
                      className="text-white/85 text-sm pl-5"
                      style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                    >
                      {config.verificationRequirement}
                    </div>
                  </div>
                </div>

                {!showInputs ? (
                  // Action Button positioned on the left
                  <div className="flex justify-start">
                    <button
                      onClick={handleButtonClick}
                      className="text-white font-bold py-4 px-8 rounded-xl transition-all text-lg hover:opacity-90 hover:scale-105 transform shadow-2xl border-2 border-white/30 backdrop-blur-sm"
                      style={{
                        backgroundColor: config.buttonColor,
                        textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
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
                      {config.buttonText || "Verify"}
                    </button>

                    {/* Error Display */}
                    {error && (
                      <div className="absolute bottom-4 left-8 right-8 p-3 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded text-red-200 text-sm">
                        {error}
                      </div>
                    )}
                  </div>
                ) : (
                  // Function Inputs Section - overlay style
                  <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-2xl">
                    <div className="mb-4">
                      <h4
                        className="text-white font-semibold text-lg mb-2"
                        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                      >
                        Complete Verification
                      </h4>
                    </div>

                    {/* Function Inputs */}
                    <div className="space-y-4 mb-6">
                      {functionInputs.map((input, index) => (
                        <div key={index}>
                          <label className="block text-white/90 text-sm mb-2 font-medium">
                            {input.name}
                            <span className="text-white/70 ml-1 text-xs">
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
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-400/50 focus:bg-white/20 placeholder-white/50"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={handleBack}
                        className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium py-3 px-6 rounded-lg transition-colors text-base border border-white/30"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleButtonClick}
                        disabled={functionInputs.some(
                          (input) => !inputValues[input.name]?.trim()
                        )}
                        className="flex-[2] text-white font-bold py-3 px-6 rounded-lg transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:scale-105 transform shadow-xl border-2 border-white/30 backdrop-blur-sm"
                        style={{
                          backgroundColor: functionInputs.some(
                            (input) => !inputValues[input.name]?.trim()
                          )
                            ? "#666"
                            : config.buttonColor,
                          textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                          boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
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
