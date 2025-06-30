"use client";

import { useState } from "react";
import { ArrowLeft, Save, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FramePreview } from "@/components/FramePreview";
import { ConfigPanel } from "@/components/ConfigPanel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppContext } from "@/contexts/AppContext";
import { LoginButton } from "@/components/common/LoginButton";
import { createWalletClient, custom, parseEther } from "viem";
import { mocaTestnet } from "@/utils/constants";
import {
  PAYMENT_GATEWAY_CONTRACT_ADDRESS,
  PAYMENT_GATEWAY_CONTRACT_ABI,
} from "@/utils/constants";

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
  const { airService, isLoggedIn } = useAppContext();

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

  const [savedConfigId, setSavedConfigId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const updateConfig = (key: keyof FrameConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    // Reset saved state when config changes
    if (savedConfigId) {
      setSavedConfigId(null);
    }
  };

  const handleSaveClick = () => {
    // Open payment modal when save is clicked
    setIsPaymentModalOpen(true);
    console.log(paymentSuccess);
  };

  const handlePaymentAndSave = async () => {
    if (!airService || !isLoggedIn) {
      setPaymentError("Please login first");
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    setPaymentSuccess(false);

    try {
      // Step 1: Save config to database
      const response = await fetch("/api/configs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to save config");
      }

      const configId = data.id;
      setSavedConfigId(configId);
      console.log(`Config saved! ID: ${configId}`);

      // Step 2: Make contract call with the ID
      const airProvider = await airService.getProvider();
      const walletClient = createWalletClient({
        transport: custom(airProvider),
        chain: mocaTestnet,
      });

      const [aaAccount] = await walletClient.getAddresses();

      await walletClient.writeContract({
        abi: PAYMENT_GATEWAY_CONTRACT_ABI,
        address: PAYMENT_GATEWAY_CONTRACT_ADDRESS as `0x${string}`,
        functionName: "payForService",
        args: [configId],
        account: aaAccount,
        value: parseEther("0.001"), // Pay 0.001 ETH
      });

      setPaymentSuccess(true);
      console.log("Payment successful!");

      // Step 3: Close payment modal and show URL modal
      setIsPaymentModalOpen(false);
      setIsUrlModalOpen(true);
    } catch (error) {
      console.error("Process error:", error);
      setPaymentError(
        error instanceof Error ? error.message : "Process failed"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const copyConfigId = () => {
    if (savedConfigId) {
      navigator.clipboard.writeText(savedConfigId);
    }
  };

  const copyEmbedUrl = () => {
    if (savedConfigId) {
      const embedUrl = `${window.location.origin}/embed/${savedConfigId}`;
      navigator.clipboard.writeText(embedUrl);
    }
  };

  const openPreview = () => {
    if (savedConfigId) {
      const previewUrl = `${window.location.origin}/embed/${savedConfigId}`;
      window.open(previewUrl, "_blank");
    }
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
          <LoginButton />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveClick}
            disabled={isProcessing}
            className="text-white/70 hover:text-white hover:bg-white/5 h-8 px-3 text-xs"
          >
            <Save className="h-3 w-3 mr-1.5" />
            {isProcessing ? "Processing..." : "Save & Deploy"}
          </Button>
          {savedConfigId && (
            <Dialog open={isUrlModalOpen} onOpenChange={setIsUrlModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/5 h-8 px-3 text-xs"
                >
                  <Copy className="h-3 w-3 mr-1.5" />
                  Share URLs
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>
      </header>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deploy Frame for Production</DialogTitle>
            <DialogDescription>
              Deploy your frame for production use with a one-time payment of
              0.001 ETH.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-medium text-blue-900 mb-2">What you get:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Production-ready frame deployment</li>
                <li>• Permanent shareable URLs</li>
                <li>• Frame embedding capabilities</li>
                <li>• Full verification functionality</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 border rounded">
              <div className="flex justify-between items-center">
                <span className="font-medium">Deployment Fee:</span>
                <span className="font-bold">0.001 ETH</span>
              </div>
            </div>

            {paymentError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {paymentError}
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentAndSave}
                disabled={isProcessing || !isLoggedIn}
                className="flex-1"
              >
                {isProcessing
                  ? "Processing..."
                  : !isLoggedIn
                  ? "Login Required"
                  : "Pay & Deploy"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* URL Sharing Modal */}
      {savedConfigId && (
        <Dialog open={isUrlModalOpen} onOpenChange={setIsUrlModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Frame Deployed Successfully! 🎉</DialogTitle>
              <DialogDescription>
                Your frame is now live! Copy the URLs below to share your frame.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Config ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Config ID</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm">
                    {savedConfigId}
                  </code>
                  <Button
                    size="sm"
                    onClick={copyConfigId}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Embed URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Embed URL</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm break-all">
                    {`${window.location.origin}/embed/${savedConfigId}`}
                  </code>
                  <Button
                    size="sm"
                    onClick={copyEmbedUrl}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <Button
                  onClick={openPreview}
                  className="w-full"
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Preview
                </Button>
              </div>

              {/* Status Section */}
              <div className="space-y-2 pt-4 border-t">
                <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✅ Frame successfully deployed and live!
                </div>

                <Button
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={!isLoggedIn}
                  className="w-full"
                  variant="outline"
                >
                  Deploy New Version
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
