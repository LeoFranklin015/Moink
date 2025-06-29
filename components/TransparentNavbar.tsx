"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useAppContext, ENV_OPTIONS } from "../contexts/AppContext";
import { LoginButton } from "./common/LoginButton";

export const TransparentNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    isLoggedIn,
    userAddress,
    handleLogin,
    handleLogout,
    currentEnv,
    setCurrentEnv,
  } = useAppContext();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const handleLogoutClick = () => {
    handleLogout();
    setIsDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLoginClick = () => {
    handleLogin();
    setMobileMenuOpen(false);
  };

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
          {isLoggedIn && userAddress ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-mono text-white">
                  {formatAddress(userAddress)}
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
                <div className="absolute right-0 mt-2 w-64 bg-black/80 backdrop-blur-md rounded-lg border border-white/20 py-1 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <div className="text-sm font-medium text-white">
                      AIR Wallet
                    </div>
                    <div className="text-xs text-white/60">Connected</div>
                    <div className="mt-1">
                      <div className="text-xs text-white/60">Address:</div>
                      <div className="text-xs font-mono text-white/90 break-all">
                        {userAddress}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-b border-white/10">
                    <div className="text-xs text-white/60 mb-1">
                      AIRKit Env:
                    </div>
                    <select
                      className="text-xs px-2 py-1 bg-black/60 border border-white/20 rounded focus:outline-none focus:ring-2 focus:ring-white/20 w-full text-white"
                      value={currentEnv}
                      //eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onChange={(e) => setCurrentEnv(e.target.value as any)}
                    >
                      {ENV_OPTIONS.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="bg-black text-white"
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <LoginButton variant="transparent" onClick={() => {}} />
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
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#"
              className="text-white/90 hover:text-white text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Use Cases
            </Link>
            <Link
              href="#"
              className="text-white/90 hover:text-white text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Moca Identity
            </Link>
            <Link
              href="#"
              className="text-white/90 hover:text-white text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="#"
              className="text-white/90 hover:text-white text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
            </Link>
            <hr className="border-white/20" />

            {/* Mobile Wallet Connection */}
            {isLoggedIn && userAddress ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-mono text-white/90">
                    {formatAddress(userAddress)}
                  </span>
                </div>

                {/* Environment Selector */}
                <div className="px-4 py-2 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60 mb-1">AIRKit Env:</div>
                  <select
                    className="text-xs px-2 py-1 bg-black/60 border border-white/20 rounded focus:outline-none focus:ring-2 focus:ring-white/20 w-full text-white"
                    value={currentEnv}
                    //eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setCurrentEnv(e.target.value as any)}
                  >
                    {ENV_OPTIONS.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-black text-white"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleLogoutClick}
                  className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <LoginButton
                  variant="transparent"
                  fullWidth={true}
                  onClick={() => setMobileMenuOpen(false)}
                />
                <Button
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm w-full justify-center"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
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
