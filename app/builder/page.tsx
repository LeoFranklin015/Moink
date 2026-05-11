"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAirkit } from "@/components/AirkitProvider";
import { LoginButton } from "@/components/common/LoginButton";
import { ConfigPanel } from "@/components/ConfigPanel";
import { FramePreview, type FrameStep } from "@/components/FramePreview";

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
  actionButtonText: string;
}

const DEFAULT_CONFIG: FrameConfig = {
  logo: "",
  backgroundColor: "#0f0f10",
  backgroundImage: "",
  title: "MEMBERS ONLY",
  description:
    "Prove you're 18+ to claim your spot. One tap, no data shared — just a zero-knowledge proof on Moca.",
  credentialId: process.env.NEXT_PUBLIC_PROGRAM_ID || "",
  verificationRequirement: "Must be 18 or older",
  buttonText: "PROVE & CLAIM",
  buttonColor: "#a8d9af",
  buttonHoverColor: "#5fcf80",
  contractAddress: "",
  abi: "[]",
  functionName: "",
  actionButtonText: "",
};

export default function FrameBuilder() {
  const { isLoggedIn } = useAirkit();
  const [config, setConfig] = useState<FrameConfig>(DEFAULT_CONFIG);

  const [savedConfigId, setSavedConfigId] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [previewStep, setPreviewStep] = useState<FrameStep>("verify");

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const updateConfig = (key: keyof FrameConfig, value: string) => {
    setConfig((p) => ({ ...p, [key]: value }));
    if (savedConfigId) setSavedConfigId(null);
  };

  const onSave = async () => {
    if (!isLoggedIn) {
      setSaveError("Please connect your wallet first.");
      return;
    }
    setIsProcessing(true);
    setSaveError(null);
    try {
      const r = await fetch("/api/configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data = await r.json();
      if (!data.success) throw new Error(data.error || "Save failed");
      setSavedConfigId(data.id);
      setIsSaveModalOpen(false);
      setIsUrlModalOpen(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const embedUrl = savedConfigId ? `${origin}/embed/${savedConfigId}` : "";

  return (
    <div className="min-h-screen px-6 lg:px-10 py-6 max-w-[1500px] mx-auto">
      {/* Top bar */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-fg-muted hover:text-fg transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 8H3m0 0l5-5m-5 5l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>
          <span className="w-px h-5 bg-edge" />
          <h1 className="text-base font-semibold tracking-tight">Frame Builder</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className={`chip ${isLoggedIn ? "chip-mint" : "chip-dark"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLoggedIn ? "bg-[rgb(var(--mint-bright))]" : "bg-[rgb(var(--fg-dim))]"}`} />
            {isLoggedIn ? "Connected" : "Disconnected"}
          </span>
          <LoginButton variant="transparent" size="sm" />
          <button
            onClick={() => setIsSaveModalOpen(true)}
            disabled={isProcessing || !isLoggedIn}
            className="btn-mint"
          >
            {isProcessing ? "Saving…" : "Save & Deploy"}
            <ArrowRight />
          </button>
        </div>
      </header>

      {/* Bento split */}
      <div className="grid grid-cols-12 gap-4">
        {/* Preview side */}
        <section className="col-span-12 lg:col-span-7 fade-up">
          <div className="card p-6 lg:p-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="section-eyebrow">Preview</span>
                <span className="mono text-[11px] text-fg-dim">720 × 720</span>
              </div>

              <StepNav
                step={previewStep}
                onChange={setPreviewStep}
                hasAction={Boolean(config.functionName)}
              />
            </div>

            {/* Canvas */}
            <div className="relative aspect-square w-full max-w-[640px] mx-auto">
              <FramePreview config={config} step={previewStep} />
            </div>
          </div>
        </section>

        {/* Config side */}
        <aside className="col-span-12 lg:col-span-5 fade-up" style={{ animationDelay: "0.05s" }}>
          <ConfigPanel
            config={config}
            updateConfig={updateConfig}
            step={previewStep}
            onStepChange={setPreviewStep}
          />
        </aside>
      </div>

      {/* Save modal */}
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="sm:max-w-md card border-0 text-fg p-0 overflow-hidden" style={{ borderRadius: 24 }}>
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-2xl font-semibold tracking-tight">Deploy frame</DialogTitle>
            <DialogDescription className="text-fg-muted mt-1">
              Persists your config and returns a permanent embed URL. No on-chain action — your wallet stays untouched.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-4 mt-4">
            <div className="bg-surface-2 rounded-2xl p-4 space-y-2.5 text-sm">
              <Row k="Title" v={config.title || "—"} />
              <Row k="Program" v={truncateMid(config.credentialId, 22) || "—"} mono />
              <Row k="Action" v={config.functionName ? `${config.functionName}()` : "—"} mono />
              <Row k="Contract" v={truncateMid(config.contractAddress, 22) || "—"} mono />
            </div>

            {saveError && (
              <div className="rounded-2xl bg-[rgb(var(--crimson)/0.10)] text-[rgb(var(--crimson))] text-xs p-3 px-4">
                {saveError}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsSaveModalOpen(false)} disabled={isProcessing} className="btn-ghost flex-1 justify-center">
                Cancel
              </button>
              <button onClick={onSave} disabled={isProcessing || !isLoggedIn} className="btn-mint flex-[2] justify-center">
                {isProcessing ? "Saving…" : !isLoggedIn ? "Connect first" : "Confirm"}
                {!isProcessing && isLoggedIn && <ArrowRight />}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* URL share modal */}
      <Dialog open={isUrlModalOpen} onOpenChange={setIsUrlModalOpen}>
        <DialogContent className="sm:max-w-lg card border-0 text-fg p-0 overflow-hidden" style={{ borderRadius: 24 }}>
          <div className="card-mint">
            <div className="px-6 py-7">
              <div className="card-mint-inner inline-flex px-3 py-1.5 mb-4">
                <span className="text-[11px] font-medium text-[#0f0f0f] tracking-wide uppercase">Deployed</span>
              </div>
              <div className="text-3xl font-semibold tracking-tight text-[#0f0f0f]">Frame is live</div>
              <p className="text-[#0f0f0f]/70 mt-1 text-sm">
                Share the URL or post it directly to X — it'll unfurl as a player card.
              </p>
            </div>
          </div>
          <div className="px-6 py-6 space-y-4">
            <Field label="Config ID" value={savedConfigId ?? ""} />
            <Field label="Embed URL" value={embedUrl} />
            <div className="flex gap-2 pt-2">
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost flex-1 justify-center"
              >
                Open preview
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  config.title + "\n\n" + embedUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-mint flex-1 justify-center"
              >
                Tweet it
                <ArrowRight />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10m0 0L8 3m5 5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StepNav({
  step, onChange, hasAction,
}: { step: FrameStep; onChange: (s: FrameStep) => void; hasAction: boolean }) {
  const items: { v: FrameStep; label: string }[] = [
    { v: "verify",  label: "Verify"  },
    { v: "action",  label: hasAction ? "Action" : "Action +" },
    { v: "success", label: "Success" },
  ];
  return (
    <div className="inline-flex items-center gap-0.5 bg-surface-2 rounded-full p-1">
      {items.map((it) => {
        const active = step === it.v;
        const isEmptyAction = it.v === "action" && !hasAction;
        return (
          <button
            key={it.v}
            onClick={() => onChange(it.v)}
            className={`h-7 px-3 text-[12px] rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
              active
                ? "bg-fg text-bg font-semibold"
                : "text-fg-muted hover:text-fg"
            }`}
            title={isEmptyAction ? "No action wired — click to configure" : undefined}
          >
            {it.label}
            {isEmptyAction && !active && (
              <span className="w-1.5 h-1.5 rounded-full bg-mint" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-fg-muted text-xs">{k}</span>
      <span className={`truncate max-w-[60%] text-sm ${mono ? "mono" : ""}`}>{v}</span>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="field-label">{label}</div>
      <div className="flex items-center bg-surface-2 rounded-xl">
        <code className="flex-1 min-w-0 px-3.5 py-2.5 text-xs mono text-fg overflow-hidden text-ellipsis whitespace-nowrap">
          {value || "—"}
        </code>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}
          aria-label="Copy"
          className="shrink-0 w-10 h-10 flex items-center justify-center text-fg-muted hover:text-fg hover:bg-raised transition-colors rounded-r-xl cursor-pointer"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10V3.5A1.5 1.5 0 014.5 2H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[rgb(var(--mint-bright))]">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function truncateMid(s: string, n = 16) {
  if (!s) return "";
  if (s.length <= n) return s;
  const half = Math.floor((n - 1) / 2);
  return `${s.slice(0, half)}…${s.slice(-half)}`;
}
