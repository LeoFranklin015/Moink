"use client";

import type React from "react";
import { Palette, Type, Shield, Code2 } from "lucide-react";
import type { FrameConfig } from "@/app/builder/page";
import type { FrameStep } from "@/components/FramePreview";

interface ConfigPanelProps {
  config: FrameConfig;
  updateConfig: (key: keyof FrameConfig, value: string) => void;
  step?: FrameStep;
  onStepChange?: (s: FrameStep) => void;
}

const colorPresets = [
  "#0f0f10",
  "#1a1a1d",
  "#0b1e16", // deep green
  "#1a2b42", // deep blue
  "#2d1b3a", // deep violet
  "#3a1414", // deep crimson
];

const buttonPresets = [
  ["#a8d9af", "#5fcf80"], // mint
  ["#f5d27a", "#e6b35a"], // amber
  ["#7ec8d4", "#5ab2c2"], // ice
  ["#d4a8d9", "#a96fb0"], // orchid
  ["#f59b8c", "#e07565"], // coral
];

const STEP_LABELS: Record<FrameStep, { title: string; sub: string }> = {
  verify:  { title: "Verify step",  sub: "What credential is required, and how to ask for it." },
  action:  { title: "Action step",  sub: "Wire a contract call to execute after verification." },
  success: { title: "Success step", sub: "Auto-rendered after the action settles." },
};

type AbiValidation =
  | { ok: true; functionFound: boolean; inputCount: number; stateMutability?: string }
  | { ok: false; error: string };

function validateAbi(abi: string, fnName: string): AbiValidation | null {
  if (!abi || abi.trim() === "" || abi.trim() === "[]") return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(abi);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? `Invalid JSON: ${e.message}` : "Invalid JSON" };
  }
  if (!Array.isArray(parsed)) {
    return { ok: false, error: "ABI must be a JSON array" };
  }
  const onlyFunctions = parsed.filter(
    (item): item is { type: string; name?: string; inputs?: unknown[]; stateMutability?: string } =>
      typeof item === "object" && item !== null && "type" in item && (item as { type: unknown }).type === "function"
  );
  if (onlyFunctions.length === 0) {
    return { ok: false, error: "No function entries found in the ABI" };
  }
  if (!fnName) {
    return { ok: true, functionFound: false, inputCount: 0 };
  }
  const fn = onlyFunctions.find((f) => f.name === fnName);
  if (!fn) {
    const names = onlyFunctions.map((f) => f.name).filter(Boolean).join(", ");
    return { ok: false, error: `Function "${fnName}" not in ABI. Available: ${names || "none"}` };
  }
  return {
    ok: true,
    functionFound: true,
    inputCount: Array.isArray(fn.inputs) ? fn.inputs.length : 0,
    stateMutability: fn.stateMutability,
  };
}

export function ConfigPanel({ config, updateConfig, step = "verify", onStepChange }: ConfigPanelProps) {
  const hasAction = Boolean(config.functionName);
  const abiValidation = validateAbi(config.abi, config.functionName);
  const stepInfo = STEP_LABELS[step];
  return (
    <div className="card p-0 overflow-hidden flex flex-col max-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-edge">
        <div className="section-eyebrow mb-1">Properties · {stepInfo.title}</div>
        <div className="text-base font-semibold tracking-tight">Configure frame</div>
        <div className="text-[12px] text-fg-muted mt-1 leading-relaxed">{stepInfo.sub}</div>
      </div>

      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
        {/* APPEARANCE */}
        <Section icon={<Palette className="w-3.5 h-3.5" />} title="Appearance">
          <Field label="Logo URL">
            <input
              type="text"
              value={config.logo}
              onChange={(e) => updateConfig("logo", e.target.value)}
              className="field-input"
              placeholder="https://…"
            />
          </Field>

          <Field label="Background image URL">
            <input
              type="text"
              value={config.backgroundImage}
              onChange={(e) => updateConfig("backgroundImage", e.target.value)}
              className="field-input"
              placeholder="https://…"
            />
            {config.backgroundImage && (
              <div className="mt-2 rounded-xl overflow-hidden bg-surface-2 aspect-[3/1]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.backgroundImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </Field>

          <Field label="Background color">
            <div className="flex items-center gap-2">
              <ColorChip value={config.backgroundColor} onChange={(v) => updateConfig("backgroundColor", v)} />
              <input
                type="text"
                value={config.backgroundColor}
                onChange={(e) => updateConfig("backgroundColor", e.target.value)}
                className="field-input flex-1 mono"
              />
            </div>
            <div className="mt-2 flex gap-1.5">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  onClick={() => updateConfig("backgroundColor", c)}
                  className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ring-1 ${
                    config.backgroundColor === c ? "ring-2 ring-[rgb(var(--mint))]" : "ring-white/10"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </Field>

          <Field label="Button colors">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-fg-dim mb-1.5 uppercase tracking-wider">Idle</div>
                <div className="flex items-center gap-2">
                  <ColorChip value={config.buttonColor} onChange={(v) => updateConfig("buttonColor", v)} />
                  <input
                    type="text"
                    value={config.buttonColor}
                    onChange={(e) => updateConfig("buttonColor", e.target.value)}
                    className="field-input flex-1 mono text-[12px]"
                  />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-fg-dim mb-1.5 uppercase tracking-wider">Hover</div>
                <div className="flex items-center gap-2">
                  <ColorChip value={config.buttonHoverColor} onChange={(v) => updateConfig("buttonHoverColor", v)} />
                  <input
                    type="text"
                    value={config.buttonHoverColor}
                    onChange={(e) => updateConfig("buttonHoverColor", e.target.value)}
                    className="field-input flex-1 mono text-[12px]"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-1.5">
              {buttonPresets.map(([idle, hover]) => (
                <button
                  key={idle}
                  onClick={() => {
                    updateConfig("buttonColor", idle);
                    updateConfig("buttonHoverColor", hover);
                  }}
                  className={`flex-1 h-7 rounded-lg overflow-hidden flex transition-transform hover:scale-[1.02] ring-1 ${
                    config.buttonColor === idle ? "ring-2 ring-[rgb(var(--mint))]" : "ring-white/10"
                  }`}
                >
                  <span className="flex-1" style={{ backgroundColor: idle }} />
                  <span className="flex-1" style={{ backgroundColor: hover }} />
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* VERIFY-STEP FIELDS */}
        {step === "verify" && <>
        <Section icon={<Type className="w-3.5 h-3.5" />} title="Content">
          <Field label="Title">
            <input
              type="text"
              value={config.title}
              onChange={(e) => updateConfig("title", e.target.value)}
              className="field-input"
              placeholder="EXCLUSIVE ACCESS"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={config.description}
              onChange={(e) => updateConfig("description", e.target.value)}
              className="field-input"
              rows={3}
              placeholder="Describe the verification…"
            />
          </Field>
          <Field label="Button text">
            <input
              type="text"
              value={config.buttonText}
              onChange={(e) => updateConfig("buttonText", e.target.value)}
              className="field-input"
              placeholder="VERIFY & CLAIM"
            />
          </Field>
        </Section>

        {/* VERIFICATION */}
        <Section icon={<Shield className="w-3.5 h-3.5" />} title="Verification">
          <Field label="Verifier program ID" hint="From Verifier → Programs in the AIRKit dashboard.">
            <input
              type="text"
              value={config.credentialId}
              onChange={(e) => updateConfig("credentialId", e.target.value)}
              className="field-input mono"
              placeholder="01KR…"
            />
          </Field>
          <Field label="Human-readable rule">
            <input
              type="text"
              value={config.verificationRequirement}
              onChange={(e) => updateConfig("verificationRequirement", e.target.value)}
              className="field-input"
              placeholder="Your age must not be 17"
            />
          </Field>
        </Section>

        {/* Action shortcut */}
        <button
          type="button"
          onClick={() => onStepChange?.("action")}
          className="w-full rounded-2xl border border-edge bg-surface-2 hover:bg-raised transition-colors p-5 text-left flex items-start gap-3 cursor-pointer"
        >
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            hasAction ? "bg-mint text-[#0b0b0c]" : "bg-fg/10 text-fg"
          }`}>
            {hasAction ? <CheckMark /> : <PlusMark />}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-fg">
              {hasAction ? "Action wired" : "Add an on-chain action"}
            </div>
            <div className="text-[12px] text-fg-muted mt-0.5 truncate">
              {hasAction
                ? <>Executes <span className="mono">{config.functionName}()</span> after verify.</>
                : "After verify, execute a contract call. Optional."}
            </div>
          </div>
          <span className="text-fg-muted text-xl leading-none">→</span>
        </button>
        </>}

        {/* ACTION-STEP FIELDS */}
        {step === "action" && <>
        <Section icon={<Code2 className="w-3.5 h-3.5" />} title="On-chain action">
          <Field label="Contract address">
            <input
              type="text"
              value={config.contractAddress}
              onChange={(e) => updateConfig("contractAddress", e.target.value)}
              className="field-input mono"
              placeholder="0x…"
            />
          </Field>
          <Field label="Function name">
            <input
              type="text"
              value={config.functionName}
              onChange={(e) => updateConfig("functionName", e.target.value)}
              className={`field-input mono ${
                config.functionName && abiValidation && !abiValidation.ok
                  ? "ring-1 ring-[rgb(245_140_140)]/40"
                  : ""
              }`}
              placeholder="increment"
            />
          </Field>
          <Field
            label="ABI"
            hint={!abiValidation ? "JSON array. Only the function entries you call are required." : undefined}
          >
            <textarea
              value={config.abi}
              onChange={(e) => updateConfig("abi", e.target.value)}
              className={`field-input mono text-[12px] ${
                abiValidation && !abiValidation.ok
                  ? "ring-1 ring-[rgb(245_140_140)] focus:ring-[rgb(245_140_140)]"
                  : abiValidation && abiValidation.ok && abiValidation.functionFound
                    ? "ring-1 ring-[rgb(var(--mint))]/40"
                    : ""
              }`}
              rows={6}
              placeholder='[{"inputs":[],"name":"increment",...}]'
            />
            {abiValidation && (
              <div className="mt-2">
                {!abiValidation.ok ? (
                  <div className="inline-flex items-start gap-1.5 text-[11px] text-[rgb(245_140_140)] leading-relaxed">
                    <XMark />
                    <span className="break-words">{abiValidation.error}</span>
                  </div>
                ) : abiValidation.functionFound ? (
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-[rgb(var(--mint-bright))] font-medium">
                    <CheckMark />
                    <span>
                      Valid · <span className="mono text-fg">{config.functionName}()</span>
                      {" · "}
                      {abiValidation.inputCount === 0
                        ? "no args"
                        : `${abiValidation.inputCount} arg${abiValidation.inputCount > 1 ? "s" : ""}`}
                      {abiValidation.stateMutability && abiValidation.stateMutability !== "nonpayable" && (
                        <> · <span className="text-fg-muted">{abiValidation.stateMutability}</span></>
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-fg-muted">
                    <Dot />
                    <span>ABI is valid JSON. Set a function name above to bind.</span>
                  </div>
                )}
              </div>
            )}
          </Field>
        </Section>

        <Section icon={<Type className="w-3.5 h-3.5" />} title="Action CTA">
          <Field label="Execute button caption" hint="Overrides the fallback “Execute {function}()”. Independent of the verify button.">
            <input
              type="text"
              value={config.actionButtonText}
              onChange={(e) => updateConfig("actionButtonText", e.target.value)}
              className="field-input"
              placeholder="CLAIM REWARD"
            />
          </Field>
        </Section>
        </>}

        {/* SUCCESS-STEP, nothing to configure */}
        {step === "success" && (
          <div className="rounded-2xl border border-edge bg-surface-2 p-6">
            <div className="section-eyebrow mb-2">Auto-rendered</div>
            <div className="text-sm text-fg leading-relaxed mb-2 font-medium">
              Success is generated automatically.
            </div>
            <div className="text-[13px] text-fg-muted leading-relaxed">
              Once the user verifies (and executes, if an action is wired), the frame flips to
              the success state with the tx hash and an explorer link. No configuration needed.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- sub-components ---- */

function Section({
  icon, title, children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-lg bg-surface-2 flex items-center justify-center text-fg-muted">
          {icon}
        </span>
        <div className="section-eyebrow">{title}</div>
      </div>
      <div className="space-y-3.5">{children}</div>
    </section>
  );
}

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="field-label mb-1.5">{label}</div>
      {children}
      {hint && <div className="text-[11px] text-fg-dim mt-1.5 leading-relaxed">{hint}</div>}
    </label>
  );
}

function ColorChip({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative shrink-0">
      <div
        className="w-9 h-9 rounded-xl ring-1 ring-white/10"
        style={{ backgroundColor: value }}
      />
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  );
}

function CheckMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function XMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Dot() {
  return (
    <span className="w-1.5 h-1.5 rounded-full bg-fg-dim inline-block shrink-0" />
  );
}
