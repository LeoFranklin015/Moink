"use client";

import { useState } from "react";
import { useAirkit } from "@/components/AirkitProvider";

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
  size = "sm",
  className = "",
  fullWidth = false,
  loadingText = "Connecting…",
  buttonText = "Connect",
  onClick,
}: LoginButtonProps) => {
  const { isInitialized, isLoggedIn, login } = useAirkit();
  const [busy, setBusy] = useState(false);

  if (isLoggedIn) return null;

  const handleClick = async () => {
    setBusy(true);
    try { await login(); onClick?.(); }
    catch (e) { console.error("Login failed", e); }
    finally { setBusy(false); }
  };

  const heightCls = size === "lg" ? "h-11 px-5 text-sm" : size === "md" ? "h-10 px-4 text-sm" : "h-9 px-4 text-[13px]";
  const widthCls = fullWidth ? "w-full justify-center" : "";

  if (!isInitialized) {
    return (
      <button
        disabled
        className={`btn-mint ${heightCls} ${widthCls} ${className}`}
        style={{ height: undefined }}
      >
        <Spinner />
        Initializing
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`btn-mint ${heightCls} ${widthCls} ${className}`}
      style={{ height: undefined }}
    >
      {busy ? (
        <>
          <Spinner />
          {loadingText}
        </>
      ) : (
        <>
          {buttonText}
          <Arrow />
        </>
      )}
    </button>
  );
};

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10m0 0L8 3m5 5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin" width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
    <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default LoginButton;
