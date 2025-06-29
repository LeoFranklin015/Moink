"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { DefaultLogin } from "@/components/ConnectButtons/DefaultLogin";

export const TransparentNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect, isPending: isDisconnecting } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Format address to show first 4 and last 4 characters
  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-white font-semibold text-xl">
          Moink
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="#"
            className="text-white/90 hover:text-white text-sm font-medium transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="#"
            className="text-white/90 hover:text-white text-sm font-medium transition-colors"
          >
            Use Cases
          </Link>
          <Link
            href="#"
            className="text-white/90 hover:text-white text-sm font-medium transition-colors"
          >
            Moca Identity
          </Link>
          <Link
            href="#"
            className="text-white/90 hover:text-white text-sm font-medium transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="text-white/90 hover:text-white text-sm font-medium transition-colors"
          >
            Docs
          </Link>
        </div>

        {/* Desktop Wallet Connection */}
        <div className="hidden md:flex items-center space-x-4">
          {!mounted ? (
            <Button
              disabled
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
              size="sm"
            >
              Connecting...
            </Button>
          ) : isConnecting ? (
            <Button
              disabled
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
              size="sm"
            >
              Connecting...
            </Button>
          ) : isConnected && address ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-mono text-white">
                  {formatAddress(address)}
                </span>
                <svg
                  className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-md rounded-lg border border-white/20 py-1 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-xs text-white/60">Connected Address</p>
                    <p className="text-sm font-mono text-white break-all">
                      {address}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      disconnect();
                      setIsDropdownOpen(false);
                    }}
                    disabled={isDisconnecting}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <DefaultLogin />
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
          <div className="flex flex-col space-y-4">
            <Link
              href="#"
              className="text-white/90 hover:text-white text-sm font-medium"
            >
              How It Works
            </Link>
            <Link
              href="#"
              className="text-white/90 hover:text-white text-sm font-medium"
            >
              Use Cases
            </Link>
            <Link
              href="#"
              className="text-white/90 hover:text-white text-sm font-medium"
            >
              Moca Identity
            </Link>
            <Link
              href="#"
              className="text-white/90 hover:text-white text-sm font-medium"
            >
              Pricing
            </Link>
            <Link
              href="#"
              className="text-white/90 hover:text-white text-sm font-medium"
            >
              Docs
            </Link>
            <hr className="border-white/20" />

            {/* Mobile Wallet Connection */}
            {!mounted ? (
              // Show loading state during hydration to match server render
              <div className="space-y-4">
                <div className="w-full h-12 bg-white/10 rounded-lg animate-pulse"></div>
                <Button
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm w-full justify-center"
                  size="sm"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : isConnecting ? (
              <Button
                disabled
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm w-full justify-center"
                size="sm"
              >
                Connecting...
              </Button>
            ) : isConnected && address ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-mono text-white/90">
                    {formatAddress(address)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    disconnect();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isDisconnecting}
                  className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <DefaultLogin />
                <Button
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm w-full justify-center"
                  size="sm"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
