"use client";

import { useState } from "react";
import { useAirkit } from "@/components/AirkitProvider";
import { Button } from "@/components/ui/button";

interface LoginButtonProps {
  variant?: "default" | "transparent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  fullWidth?: boolean;
  showIcon?: boolean;
  loadingText?: string;
  buttonText?: string;
  onClick?: () => void;
}

export const LoginButton = ({
  variant = "default",
  size = "sm",
  className = "",
  fullWidth = false,
  showIcon = true,
  loadingText = "Connecting...",
  buttonText = "Connect Wallet",
  onClick,
}: LoginButtonProps) => {
  const { isInitialized, isLoggedIn, login } = useAirkit();
  const [isLoading, setIsLoading] = useState(false);

  if (isLoggedIn) return null;

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await login();
      onClick?.();
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const variantStyles = {
    transparent: "bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white",
    ghost: "text-gray-700 hover:bg-gray-100 bg-transparent",
    default: "bg-blue-600 hover:bg-blue-700 text-white border border-transparent",
  }[variant];

  const sizeStyles = { lg: "px-6 py-3 text-base", md: "px-4 py-2 text-sm", sm: "px-4 py-2 text-sm" }[size];

  const baseStyles =
    "inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200";

  const cn = `${baseStyles} ${variantStyles} ${sizeStyles} ${fullWidth ? "w-full justify-center" : ""} ${className}`.trim();

  if (!isInitialized) {
    return (
      <Button disabled className={cn}>
        {showIcon && <Spinner />}
        Initializing...
      </Button>
    );
  }

  return (
    <Button onClick={handleClick} disabled={isLoading} className={cn}>
      {isLoading ? (
        <>
          {showIcon && <Spinner />}
          {loadingText}
        </>
      ) : (
        <>
          {showIcon && (
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
          {buttonText}
        </>
      )}
    </Button>
  );
};

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default LoginButton;
