"use client";

import { useAppContext } from "../../contexts/AppContext";
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
  const { isLoading, isInitialized, isLoggedIn, handleLogin } = useAppContext();

  // Don't render if already logged in
  if (isLoggedIn) {
    return null;
  }

  const handleClick = () => {
    handleLogin();
    onClick?.();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "transparent":
        return "bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm";
      case "outline":
        return "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white";
      case "ghost":
        return "text-gray-700 hover:bg-gray-100 bg-transparent";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white border border-transparent";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "lg":
        return "px-6 py-3 text-base";
      case "md":
        return "px-4 py-2 text-sm";
      default:
        return "px-4 py-2 text-sm";
    }
  };

  const baseStyles =
    "inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200";
  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const widthStyles = fullWidth ? "w-full justify-center" : "";

  const combinedClassName =
    `${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${className}`.trim();

  if (!isInitialized) {
    return (
      <Button disabled className={combinedClassName}>
        {showIcon && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        Initializing...
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={combinedClassName}
    >
      {isLoading ? (
        <>
          {showIcon && (
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {loadingText}
        </>
      ) : (
        <>
          {showIcon && (
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          )}
          {buttonText}
        </>
      )}
    </Button>
  );
};

export default LoginButton;
