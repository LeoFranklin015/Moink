"use client";

import type React from "react";
import { Upload, Palette, Type, Shield, Code2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { FrameConfig } from "@/app/builder/page";

interface ConfigPanelProps {
  config: FrameConfig;
  updateConfig: (key: keyof FrameConfig, value: string) => void;
}

export function ConfigPanel({ config, updateConfig }: ConfigPanelProps) {
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateConfig("logo", e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateConfig("backgroundImage", e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const colorPresets = [
    "#1a2b42",
    "#2d1b69",
    "#7c2d12",
    "#166534",
    "#1e293b",
    "#374151",
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.08] flex-shrink-0">
        <h2 className="text-sm font-medium text-white">Properties</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Appearance */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <Palette className="h-4 w-4 text-white/60" />
              <h3 className="text-xs font-medium text-white/90 uppercase tracking-wide">
                Appearance
              </h3>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label className="text-xs text-white/70">Logo</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex-1 flex items-center justify-center h-8 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-md cursor-pointer transition-colors"
                >
                  <Upload className="h-3 w-3 text-white/60 mr-1.5" />
                  <span className="text-xs text-white/70">Upload</span>
                </label>
                {config.logo && (
                  <img
                    src={config.logo || "/placeholder.svg"}
                    alt="Logo"
                    className="h-8 w-8 object-contain rounded border border-white/[0.08]"
                  />
                )}
              </div>
            </div>

            {/* Background Image */}
            <div className="space-y-2">
              <Label className="text-xs text-white/70">Background Image</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="hidden"
                  id="background-upload"
                />
                <label
                  htmlFor="background-upload"
                  className="flex-1 flex items-center justify-center h-8 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-md cursor-pointer transition-colors"
                >
                  <Upload className="h-3 w-3 text-white/60 mr-1.5" />
                  <span className="text-xs text-white/70">Upload</span>
                </label>
                {config.backgroundImage && (
                  <img
                    src={config.backgroundImage || "/placeholder.svg"}
                    alt="Background"
                    className="h-8 w-12 object-cover rounded border border-white/[0.08]"
                  />
                )}
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <Label className="text-xs text-white/70">Background</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) =>
                    updateConfig("backgroundColor", e.target.value)
                  }
                  className="w-8 h-8 rounded border border-white/[0.08] bg-transparent cursor-pointer"
                />
                <Input
                  value={config.backgroundColor}
                  onChange={(e) =>
                    updateConfig("backgroundColor", e.target.value)
                  }
                  className="flex-1 h-8 bg-white/[0.05] border-white/[0.08] text-white text-xs font-mono"
                />
              </div>
              <div className="flex space-x-1">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateConfig("backgroundColor", color)}
                    className={`w-6 h-6 rounded border-2 transition-all ${
                      config.backgroundColor === color
                        ? "border-white/40 scale-110"
                        : "border-white/[0.08] hover:border-white/20"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Button Colors */}
            <div className="space-y-2">
              <Label className="text-xs text-white/70">Button Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={config.buttonColor}
                  onChange={(e) => updateConfig("buttonColor", e.target.value)}
                  className="w-8 h-8 rounded border border-white/[0.08] bg-transparent cursor-pointer"
                />
                <Input
                  value={config.buttonColor}
                  onChange={(e) => updateConfig("buttonColor", e.target.value)}
                  className="flex-1 h-8 bg-white/[0.05] border-white/[0.08] text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-white/70">Button Hover</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={config.buttonHoverColor}
                  onChange={(e) =>
                    updateConfig("buttonHoverColor", e.target.value)
                  }
                  className="w-8 h-8 rounded border border-white/[0.08] bg-transparent cursor-pointer"
                />
                <Input
                  value={config.buttonHoverColor}
                  onChange={(e) =>
                    updateConfig("buttonHoverColor", e.target.value)
                  }
                  className="flex-1 h-8 bg-white/[0.05] border-white/[0.08] text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <Type className="h-4 w-4 text-white/60" />
              <h3 className="text-xs font-medium text-white/90 uppercase tracking-wide">
                Content
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-white/70 mb-1.5 block">
                  Title
                </Label>
                <Input
                  value={config.title}
                  onChange={(e) => updateConfig("title", e.target.value)}
                  className="h-8 bg-white/[0.05] border-white/[0.08] text-white text-xs"
                  placeholder="Frame title"
                />
              </div>

              <div>
                <Label className="text-xs text-white/70 mb-1.5 block">
                  Description
                </Label>
                <Textarea
                  value={config.description}
                  onChange={(e) => updateConfig("description", e.target.value)}
                  className="min-h-[60px] bg-white/[0.05] border-white/[0.08] text-white text-xs resize-none"
                  placeholder="Frame description"
                />
              </div>

              <div>
                <Label className="text-xs text-white/70 mb-1.5 block">
                  Button Text
                </Label>
                <Input
                  value={config.buttonText}
                  onChange={(e) => updateConfig("buttonText", e.target.value)}
                  className="h-8 bg-white/[0.05] border-white/[0.08] text-white text-xs"
                  placeholder="Button text"
                />
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="h-4 w-4 text-white/60" />
              <h3 className="text-xs font-medium text-white/90 uppercase tracking-wide">
                Verification
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-white/70 mb-1.5 block">
                  Credential ID
                </Label>
                <Input
                  value={config.credentialId}
                  onChange={(e) => updateConfig("credentialId", e.target.value)}
                  className="h-8 bg-white/[0.05] border-white/[0.08] text-white text-xs font-mono"
                  placeholder="credential-id"
                />
              </div>

              <div>
                <Label className="text-xs text-white/70 mb-1.5 block">
                  Requirement
                </Label>
                <Input
                  value={config.verificationRequirement}
                  onChange={(e) =>
                    updateConfig("verificationRequirement", e.target.value)
                  }
                  className="h-8 bg-white/[0.05] border-white/[0.08] text-white text-xs"
                  placeholder="e.g., Verify 18+"
                />
              </div>
            </div>
          </div>

          {/* Smart Contract */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <Code2 className="h-4 w-4 text-white/60" />
              <h3 className="text-xs font-medium text-white/90 uppercase tracking-wide">
                Contract
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-white/70 mb-1.5 block">
                  Address
                </Label>
                <Input
                  value={config.contractAddress}
                  onChange={(e) =>
                    updateConfig("contractAddress", e.target.value)
                  }
                  className="h-8 bg-white/[0.05] border-white/[0.08] text-white text-xs font-mono"
                  placeholder="0x..."
                />
              </div>

              <div>
                <Label className="text-xs text-white/70 mb-1.5 block">
                  Function
                </Label>
                <Input
                  value={config.functionName}
                  onChange={(e) => updateConfig("functionName", e.target.value)}
                  className="h-8 bg-white/[0.05] border-white/[0.08] text-white text-xs font-mono"
                  placeholder="function name"
                />
              </div>

              <div>
                <Label className="text-xs text-white/70 mb-1.5 block">
                  ABI
                </Label>
                <Textarea
                  value={config.abi}
                  onChange={(e) => updateConfig("abi", e.target.value)}
                  className="min-h-[80px] bg-white/[0.05] border-white/[0.08] text-white text-xs font-mono resize-none"
                  placeholder="Contract ABI..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
