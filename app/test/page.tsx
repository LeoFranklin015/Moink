"use client";

import { useState } from "react";
import Link from "next/link";
import { useAirkit } from "@/components/AirkitProvider";
import { getAuthToken } from "@/lib/airkit-auth";
import { Navbar } from "@/components/Navbar";

const ISSUER_DID = process.env.NEXT_PUBLIC_ISSUER_DID!;
const CREDENTIAL_ID = process.env.NEXT_PUBLIC_CREDENTIAL_ID!;

// Set NEXT_PUBLIC_DEMO_TWEET_URL in .env.local to point at the real tweet.
const DEMO_TWEET_URL = process.env.NEXT_PUBLIC_DEMO_TWEET_URL || "#tweet";

type Phase = "need-login" | "ready" | "issuing" | "issued" | "error";

export default function TestPage() {
  const { service, isInitialized, isLoggedIn, address, login } = useAirkit();
  const [busy, setBusy] = useState(false);
  const [issuedAt, setIssuedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const phase: Phase = !isInitialized
    ? "need-login"
    : errorMsg
      ? "error"
      : busy
        ? "issuing"
        : issuedAt
          ? "issued"
          : !isLoggedIn
            ? "need-login"
            : "ready";

  const onConnect = async () => {
    setBusy(true);
    setErrorMsg(null);
    try {
      await login();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Connect failed");
    } finally {
      setBusy(false);
    }
  };

  const onIssue = async () => {
    if (!service) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      const jwt = await getAuthToken("issue");
      await service.issueCredential({
        authToken: jwt,
        issuerDid: ISSUER_DID,
        credentialId: CREDENTIAL_ID,
        credentialSubject: { id: `did:example:test-${Date.now()}`, age: 25 },
      });
      setIssuedAt(new Date().toISOString());
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Issuance failed");
    } finally {
      setBusy(false);
    }
  };

  const truncate = (s?: string | null) =>
    !s ? "" : s.length <= 14 ? s : `${s.slice(0, 6)}…${s.slice(-4)}`;

  return (
    <main className="min-h-screen relative">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(60% 50% at 80% -10%, rgb(var(--mint) / 0.14), transparent 60%), radial-gradient(40% 40% at 0% 100%, rgb(var(--mint-bright) / 0.08), transparent 60%)",
          }}
        />
      </div>

      <Navbar />

      {/* Hero, state machine */}
      <section className="px-4 lg:px-6 pt-20 lg:pt-28 pb-24 lg:pb-32 max-w-[1100px] mx-auto">
        <div className="text-center fade-up">
          <span className="section-eyebrow mb-4 block">Try it yourself</span>

          <h1
            className="text-fg font-semibold tracking-tight leading-[1.04] mb-5"
            style={{ fontSize: "clamp(36px, 6vw, 64px)" }}
          >
            {phase === "issued" ? (
              <>Your <span className="text-mint">18+ credential</span> is live.</>
            ) : (
              <>Prove you're <span className="text-mint">18+</span>. Without sharing your age.</>
            )}
          </h1>

          <p className="text-fg-muted text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            {phase === "issued"
              ? "Bound to your AIR account on Moca testnet. Use it on the demo tweet below, or anywhere identityX checks age."
              : "We'll issue a sample age credential to your AIR account on Moca testnet. Use it to unlock any identityX frame that gates on age, starting with the demo on X."}
          </p>

          {/* Single state-aware CTA */}
          <div className="inline-flex flex-col items-center gap-3">
            <CtaForPhase
              phase={phase}
              onConnect={onConnect}
              onIssue={onIssue}
              busy={busy}
            />

            {/* Tiny status line */}
            <StatusLine
              phase={phase}
              address={address}
              issuedAt={issuedAt}
              errorMsg={errorMsg}
              truncate={truncate}
            />
          </div>
        </div>
      </section>

      <MintRule />

      {/* What's next, two cards */}
      <section className="px-4 lg:px-6 py-24 lg:py-28 max-w-[1100px] mx-auto">
        <div className="text-center mb-12 fade-up">
          <span className="section-eyebrow mb-3 block">What's next</span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Use it. Or build your own.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NextCard
            href={DEMO_TWEET_URL}
            external
            num="01"
            title="See it live on X"
            blurb="We posted a demo frame on Twitter. Open the tweet, click verify, and your fresh credential will satisfy the rule."
            cta="Open the tweet"
            highlight={phase === "issued"}
          />
          <NextCard
            href="/builder"
            num="02"
            title="Create your own frame"
            blurb="Compose any credential check + wire a contract function. Save it, drop the URL on X, settle on-chain."
            cta="Open the builder"
          />
        </div>
      </section>

      <footer className="border-t border-edge mt-8">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8 flex items-center justify-between text-xs text-fg-dim">
          <span>© identityX · built on Moca Network</span>
          <span>v0.1 · prototype</span>
        </div>
      </footer>
    </main>
  );
}

/* ---------- Pieces ---------- */

function CtaForPhase({
  phase, onConnect, onIssue, busy,
}: { phase: Phase; onConnect: () => void; onIssue: () => void; busy: boolean }) {
  if (phase === "need-login") {
    return (
      <button onClick={onConnect} disabled={busy} className="btn-mint h-11 px-6 text-sm cursor-pointer">
        Connect AIR account
        <Arrow />
      </button>
    );
  }
  if (phase === "ready") {
    return (
      <button onClick={onIssue} disabled={busy} className="btn-mint h-11 px-6 text-sm cursor-pointer">
        Issue credential
        <Arrow />
      </button>
    );
  }
  if (phase === "issuing") {
    return (
      <button disabled className="btn-mint h-11 px-6 text-sm cursor-not-allowed opacity-60">
        <Spinner />
        Issuing…
      </button>
    );
  }
  if (phase === "issued") {
    return (
      <span className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-mint text-[#0b0b0c] text-sm font-semibold">
        <Check />
        Credential issued
      </span>
    );
  }
  // error
  return (
    <button onClick={onIssue} className="btn-mint h-11 px-6 text-sm cursor-pointer">
      Try again
      <Arrow />
    </button>
  );
}

function StatusLine({
  phase, address, issuedAt, errorMsg, truncate,
}: { phase: Phase; address: string | null; issuedAt: string | null; errorMsg: string | null; truncate: (s?: string | null) => string }) {
  if (phase === "need-login") return null;
  if (phase === "error") {
    return (
      <div className="mono text-[12px] text-[rgb(245_140_140)] max-w-md text-center">
        {errorMsg}
      </div>
    );
  }
  if (phase === "issued") {
    return (
      <div className="mono text-[12px] text-fg-muted">
        age = 25 · holder <span className="text-fg">{truncate(address)}</span> · {new Date(issuedAt!).toLocaleTimeString()}
      </div>
    );
  }
  return (
    <div className="mono text-[12px] text-fg-dim">
      connected as <span className="text-fg-muted">{truncate(address)}</span>
    </div>
  );
}

function NextCard({
  href, external, num, title, blurb, cta, highlight,
}: {
  href: string; external?: boolean; num: string; title: string; blurb: string; cta: string; highlight?: boolean;
}) {
  const className = `card p-7 lg:p-8 min-h-[220px] flex flex-col justify-between card-hover group ${
    highlight ? "ring-1 ring-[rgb(var(--mint)/0.45)]" : ""
  }`;

  const inner = (
    <>
      <div className="flex items-center justify-between mb-8">
        <span className="section-eyebrow">№ {num}</span>
        {highlight && <span className="chip chip-mint">Ready</span>}
      </div>
      <div>
        <h3 className="text-2xl font-semibold tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-fg-muted leading-relaxed mb-6">{blurb}</p>
        <span className="inline-flex items-center gap-2 text-sm text-fg group-hover:text-mint transition-colors">
          {cta}
          <Arrow />
        </span>
      </div>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return <Link href={href} className={className}>{inner}</Link>;
}

function MintRule() {
  return (
    <div className="flex items-center justify-center">
      <span className="block w-16 h-px bg-mint" />
    </div>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10m0 0L8 3m5 5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
