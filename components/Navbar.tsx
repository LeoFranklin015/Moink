"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAirkit } from "@/components/AirkitProvider";
import { LoginButton } from "@/components/common/LoginButton";

const NAV_LINKS: { href: string; label: string; external?: boolean }[] = [
  { href: "/test", label: "Demo" },
  { href: "/builder", label: "Builder" },
];

export function Navbar({ floating = true }: { floating?: boolean }) {
  const { isLoggedIn, address, logout } = useAirkit();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const fmt = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  return (
    <header
      className={
        floating
          ? "sticky top-4 z-40 mx-4 lg:mx-6"
          : "border-b border-edge"
      }
    >
      <nav
        className={
          floating
            ? "max-w-[1400px] mx-auto bg-surface/80 backdrop-blur-xl border border-edge rounded-full px-3 pl-5 py-2 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
            : "max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between"
        }
      >
        <Link href="/" className="flex items-center gap-2.5 group">
          <span
            className="relative inline-flex items-center justify-center w-7 h-7 rounded-lg transition-transform group-hover:scale-105 overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgb(var(--mint)) 0%, rgb(var(--mint-bright)) 100%)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              {/* identityX mark: interlocking X with a vertical stroke (i) */}
              <path
                d="M3.5 3.5l9 9M12.5 3.5l-9 9"
                stroke="#0b0b0c"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="8" cy="8" r="1.4" fill="#0b0b0c" />
            </svg>
          </span>
          <span className="text-base font-semibold tracking-tight">
            identity<span className="text-mint">X</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-surface-2/60 rounded-full p-1">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 h-8 inline-flex items-center text-[13px] text-fg-muted hover:text-fg rounded-full hover:bg-raised transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 h-8 inline-flex items-center text-[13px] text-fg-muted hover:text-fg rounded-full hover:bg-raised transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn && address ? (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 h-9 pl-3 pr-3.5 bg-surface-2 hover:bg-raised rounded-full text-[13px] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--mint-bright))]" />
                <span className="mono text-fg">{fmt(address)}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" className={`text-fg-muted transition-transform ${open ? "rotate-180" : ""}`}>
                  <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-72 bg-surface border border-edge rounded-2xl py-2 shadow-[0_12px_40px_rgba(0,0,0,0.5)] z-50">
                  <div className="px-4 py-3 border-b border-edge">
                    <div className="text-[11px] section-eyebrow mb-1">AIR Account</div>
                    <div className="text-xs mono text-fg break-all">{address}</div>
                  </div>
                  <div className="px-2 py-2">
                    <button
                      onClick={() => { logout(); setOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm text-crimson hover:bg-[rgb(var(--crimson)/0.08)] transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <LoginButton variant="default" size="sm" buttonText="Connect" />
          )}
        </div>
      </nav>
    </header>
  );
}
