"use client";

import { useState } from "react";
import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FramePreview } from "@/components/FramePreview";
import { ConfigPanel } from "@/components/ConfigPanel";

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

export default function FrameBuilder() {
  const [config, setConfig] = useState<FrameConfig>({
    logo: "",
    backgroundColor: "#000000",
    backgroundImage: "",
    title: "EXCLUSIVE ACCESS",
    description:
      "Join the elite community and unlock premium features. Verify your identity to access exclusive content and special privileges.",
    credentialId: "exclusive-access-v1",
    verificationRequirement: "Your age is 18 or above",
    buttonText: "GET EXCLUSIVE ACCESS",
    buttonColor: "#ff6b35",
    buttonHoverColor: "#e55a2b",
    contractAddress: "0x1234567890123456789012345678901234567890",
    abi: JSON.stringify(
      [
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "user",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint8",
              name: "kycLevel",
              type: "uint8",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "timestamp",
              type: "uint256",
            },
          ],
          name: "KYCVerified",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "user",
              type: "address",
            },
          ],
          name: "KYCRevoked",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_user",
              type: "address",
            },
          ],
          name: "getKYCStatus",
          outputs: [
            {
              internalType: "bool",
              name: "isVerified",
              type: "bool",
            },
            {
              internalType: "uint8",
              name: "kycLevel",
              type: "uint8",
            },
            {
              internalType: "uint256",
              name: "verificationDate",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_user",
              type: "address",
            },
          ],
          name: "revokeKYC",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_user",
              type: "address",
            },
            {
              internalType: "uint8",
              name: "_kycLevel",
              type: "uint8",
            },
            {
              internalType: "string",
              name: "_documentHash",
              type: "string",
            },
          ],
          name: "verifyKYC",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "kycData",
          outputs: [
            {
              internalType: "bool",
              name: "isVerified",
              type: "bool",
            },
            {
              internalType: "uint8",
              name: "kycLevel",
              type: "uint8",
            },
            {
              internalType: "uint256",
              name: "verificationDate",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "documentHash",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      null,
      2
    ),
    functionName: "verifyKYC",
  });

  const updateConfig = (key: keyof FrameConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-white/[0.08] bg-black/80 backdrop-blur-xl flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex items-center text-white/70 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="text-sm font-medium text-white">Frame Builder</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/5 h-8 px-3 text-xs"
          >
            Save
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-4 text-xs"
          >
            <Play className="h-3 w-3 mr-1.5" />
            Deploy
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 bg-zinc-950 flex items-center justify-center">
          <FramePreview config={config} />
        </div>

        {/* Config Panel */}
        <div className="w-80 border-l border-white/[0.08] bg-black/95 backdrop-blur-xl flex flex-col">
          <ConfigPanel config={config} updateConfig={updateConfig} />
        </div>
      </div>
    </div>
  );
}
