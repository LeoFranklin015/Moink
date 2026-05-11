"use client";

import { useMemo, useState } from "react";

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

export type FrameStep = "verify" | "action" | "success";

interface FunctionInput {
  name: string;
  type: string;
}
interface AbiFunction {
  name: string;
  type: string;
  inputs: FunctionInput[];
  stateMutability?: string;
}

export function FramePreview({
  config,
  step = "verify",
}: {
  config: FrameConfig;
  step?: FrameStep;
}) {
  const inputs = useMemo<FunctionInput[]>(() => {
    try {
      if (!config.abi || !config.functionName) return [];
      const parsed = JSON.parse(config.abi) as AbiFunction[];
      const fn = parsed.find((f) => f.type === "function" && f.name === config.functionName);
      return fn?.inputs ?? [];
    } catch { return []; }
  }, [config.abi, config.functionName]);

  const hasAction = Boolean(config.functionName);
  const stepNumber = step === "verify" ? 1 : step === "action" ? 2 : 3;
  const totalSteps = hasAction ? 3 : 2;
  const visibleStepNumber = hasAction ? stepNumber : step === "verify" ? 1 : 2;

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-[20px]"
      style={{ backgroundColor: config.backgroundColor || "#0b0b0c" }}
    >
      {/* Background image */}
      {config.backgroundImage && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${config.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.55,
          }}
        />
      )}
      {/* Readability layer */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.60) 60%, rgba(0,0,0,0.92) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-8 lg:p-10">
        {/* Header: brand + step indicator */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] tracking-[0.18em] uppercase text-white/70 font-medium">
            identity<span className="text-mint">X</span>
          </span>
          <span className="mono text-[11px] text-white/45 tabular-nums tracking-[0.06em]">
            {String(visibleStepNumber).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
          </span>
        </div>

        {/* Hero region */}
        <div className="flex-1 flex flex-col justify-center -mt-6">
          {step === "verify" && <VerifyState config={config} />}
          {step === "action" && <ActionState config={config} inputs={inputs} />}
          {step === "success" && <SuccessState config={config} />}
        </div>

        {/* Step pips */}
        <div className="flex items-center gap-1.5 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`h-0.5 rounded-full transition-all ${
                i + 1 === visibleStepNumber ? "w-8 bg-mint" : "w-3 bg-white/15"
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        {step === "verify" && (
          <CtaButton color={config.buttonColor} hover={config.buttonHoverColor}>
            {config.buttonText || "Verify"} <Arrow />
          </CtaButton>
        )}
        {step === "action" && (
          <CtaButton color={config.buttonColor} hover={config.buttonHoverColor}>
            {config.actionButtonText
              ? config.actionButtonText
              : `Execute ${config.functionName ? `${config.functionName}()` : "action"}`}
            <Arrow />
          </CtaButton>
        )}
        {step === "success" && (
          <button className="h-12 rounded-[14px] bg-white/10 text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 transition-colors hover:bg-white/15 cursor-pointer">
            View on explorer <Arrow />
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- States ---------- */

function VerifyState({ config }: { config: FrameConfig }) {
  return (
    <>
      {config.title && (
        <div className="text-[12px] tracking-[0.14em] uppercase text-white/55 font-medium mb-3">
          {config.title}
        </div>
      )}
      <h2
        className="text-white font-semibold tracking-tight leading-[1.04]"
        style={{ fontSize: "clamp(28px, 4.4vw, 46px)" }}
      >
        {config.verificationRequirement || "Prove a credential to continue"}
      </h2>
      {config.description && (
        <p className="text-white/65 mt-4 leading-relaxed text-[14px] max-w-[440px]">
          {config.description}
        </p>
      )}
    </>
  );
}

function ActionState({ config, inputs }: { config: FrameConfig; inputs: FunctionInput[] }) {
  const truncate = (s: string) => (s.length <= 14 ? s : `${s.slice(0, 6)}…${s.slice(-4)}`);
  return (
    <>
      <div className="inline-flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-mint">
          <Check />
        </span>
        <span className="text-[12px] tracking-[0.14em] uppercase text-mint font-medium">
          Verified
        </span>
      </div>
      <h2
        className="text-white font-semibold tracking-tight leading-[1.02] break-all"
        style={{ fontSize: "clamp(28px, 4.4vw, 44px)" }}
      >
        <span className="mono">{config.functionName || "execute"}()</span>
      </h2>
      {config.contractAddress && (
        <div className="mt-4 text-[13px] text-white/55">
          on <span className="mono text-white/80">{truncate(config.contractAddress)}</span>
        </div>
      )}
      {inputs.length > 0 && (
        <div className="mt-5 space-y-1.5">
          {inputs.map((inp) => (
            <div
              key={inp.name}
              className="flex items-baseline justify-between gap-3 text-[12px] mono"
            >
              <span className="text-white/55">{inp.name || "_"}</span>
              <span className="text-white/35">{inp.type}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function SuccessState({ config }: { config: FrameConfig }) {
  return (
    <>
      <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-mint mb-6">
        <Check large />
      </span>
      <h2
        className="text-white font-semibold tracking-tight leading-[1.02]"
        style={{ fontSize: "clamp(28px, 4.4vw, 44px)" }}
      >
        Done.
      </h2>
      <p className="text-white/65 mt-3 leading-relaxed text-[14px] max-w-[440px]">
        {config.functionName
          ? <>Verified &amp; executed <span className="mono text-white/85">{config.functionName}()</span>. Tx settled on Moca testnet.</>
          : <>Credential verified. You're cleared.</>
        }
      </p>
      <div className="mt-5 inline-flex items-center gap-2 text-[12px] text-white/55 mono">
        <span className="w-1.5 h-1.5 rounded-full bg-mint" />
        0xa8d9…7c0b
      </div>
    </>
  );
}

/* ---------- Atoms ---------- */

function CtaButton({
  color, hover, children,
}: { color: string; hover: string; children: React.ReactNode }) {
  const [over, setOver] = useState(false);
  return (
    <button
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => setOver(false)}
      className="h-12 rounded-[14px] text-[#0b0b0c] font-semibold text-[14px] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
      style={{ backgroundColor: over ? hover : color, letterSpacing: "0.02em" }}
    >
      {children}
    </button>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10m0 0L8 3m5 5l-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check({ large }: { large?: boolean }) {
  const s = large ? 22 : 12;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <path d="M3.5 8.5l3 3 6-7" stroke="#0b0b0c" strokeWidth={large ? 2 : 2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
