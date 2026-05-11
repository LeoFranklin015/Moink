import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* atmospheric glows */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(60% 50% at 80% -10%, rgb(var(--mint) / 0.18), transparent 60%), radial-gradient(40% 40% at 0% 100%, rgb(var(--mint-bright) / 0.10), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <Navbar />

      {/* Hero */}
      <section className="px-4 lg:px-6 pt-16 lg:pt-24 pb-28 lg:pb-32 max-w-[1400px] mx-auto">
        <div className="text-center max-w-5xl mx-auto fade-up">
          <span className="chip chip-dark mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--mint-bright))]" />
            Live · Moca Testnet
          </span>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.04] mb-6">
            Stop sending users away.
            <br />
            <span className="text-mint">Convert them inside Twitter.</span>
          </h1>

          <p className="text-fg-muted text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Let users instantly prove their identity or eligibility using their existing Moca-issued credentials —
            without ever leaving their social feed. More engagement. Less friction. Higher conversions.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/builder" className="btn-mint">
              Start creating frames
              <ArrowRight />
            </Link>
            <Link href="/test" className="btn-ghost">
              See demo frame
            </Link>
          </div>
        </div>
      </section>

      {/* Band: From Awareness to Action — three step */}
      <section id="how" className="relative">
        <MintRule />
        <div className="px-4 lg:px-6 py-24 lg:py-28 max-w-[1400px] mx-auto">
          <div className="text-center mb-14 fade-up">
            <span className="section-eyebrow mb-3 block">How it works</span>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl mx-auto leading-[1.1]">
              From awareness to action
              <span className="text-mint">—inside Twitter.</span>
            </h2>
            <p className="text-fg-muted mt-4 max-w-3xl mx-auto">
              Instead of running ads and hoping users click away to complete steps (leading to drop-offs),
              let users take verified actions directly within their Twitter feed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StepCard
              n="01"
              title="Choose an Intent"
              blurb="Select from KYC status checks, loyalty verification, on-chain achievements, or any Moca-issued identity proof for your campaign."
            />
            <StepCard
              n="02"
              title="Frame Triggers Proof"
              blurb="Users already have their identity and credentials from Moca Identity. We verify the proof on-demand, seamlessly inside the Frame."
            />
            <StepCard
              n="03"
              title="Unlock Action"
              blurb="Once verified, users can instantly apply, register, claim, participate, or join—all without leaving Twitter."
              highlight
            />
          </div>
        </div>
      </section>

      {/* Band: Two-column benefits */}
      <section className="relative">
        <MintRule />
        <div className="px-4 lg:px-6 py-24 lg:py-28 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BenefitsCard
            eyebrow="For Operators"
            title="Why teams use it"
            items={[
              ["No redirect drop-offs", "Keep users engaged within their natural social environment."],
              ["Frictionless funnel", "Eliminate multiple steps and form abandonment."],
              ["Higher engagement", "Leverage social proof and community context."],
              ["Real-time qualification", "Instant verification without manual processes."],
              ["On-chain trust layer", "Cryptographic proof bound to Moca DIDs."],
            ]}
          />
          <BenefitsCard
            eyebrow="For Users"
            title="Why people don't bounce"
            items={[
              ["Already verified via Moca", "No re-entry of personal info or documents."],
              ["No extra steps required", "One-click verification and action completion."],
              ["One-click social interaction", "Native to the Twitter experience."],
              ["Instant gratification", "Immediate results without waiting or redirects."],
              ["Stay in your favorite platform", "Never leave the comfort of your social feed."],
            ]}
            tone="mint"
          />
        </div>
        </div>
      </section>

      {/* Band: Use cases */}
      <section id="use-cases" className="relative">
        <MintRule />
        <div className="px-4 lg:px-6 py-24 lg:py-28 max-w-[1400px] mx-auto">
          <div className="text-center mb-12 fade-up">
            <span className="section-eyebrow mb-3 block">Example intents</span>
            <h3 className="text-3xl md:text-5xl font-semibold tracking-tight">Pick one. Or compose your own.</h3>
            <p className="text-fg-muted mt-4 max-w-2xl mx-auto">
              Choose from these popular verification intents or create custom ones for your specific business needs.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <UseCase title="Check KYC Status" desc="Verify identity compliance and regulatory requirements." />
            <UseCase title="Verify Loyalty" desc="Confirm membership status and reward eligibility." />
            <UseCase title="On-chain Achievements" desc="Validate blockchain credentials and NFT ownership." />
            <UseCase title="Social Verification" desc="Prove engagement and community participation." />
          </div>
        </div>
      </section>

      {/* Band: CTA */}
      <section className="relative">
        <MintRule />
        <div className="px-4 lg:px-6 py-24 lg:py-28 max-w-[1400px] mx-auto">
          <div className="card-mint p-10 lg:p-16 text-center fade-up relative overflow-hidden">
            <h3 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#0f0f0f] mb-4 max-w-3xl mx-auto leading-[1.1]">
              Ready to convert users inside Twitter?
            </h3>
            <p className="text-[#0f0f0f]/70 text-lg max-w-2xl mx-auto mb-8">
              Join forward-thinking businesses using identityX to turn social attention into verified
              actions with Moca Identity&apos;s trust layer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/builder"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#0f0f0f] text-mint text-sm font-medium hover:bg-black transition-colors"
              >
                Start building frames
                <ArrowRight />
              </Link>
              <Link
                href="/test"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-white/40 text-[#0f0f0f] text-sm font-medium hover:bg-white/60 transition-colors"
              >
                Schedule demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-edge">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8 flex items-center justify-between text-xs text-fg-dim">
          <span>© identityX — built on Moca Network</span>
          <span>v0.1 · prototype</span>
        </div>
      </footer>
    </main>
  );
}

function MintRule() {
  return (
    <div className="flex items-center justify-center pt-12 lg:pt-16">
      <span className="block w-16 h-px bg-mint" />
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


function StepCard({ n, title, blurb, highlight }: { n: string; title: string; blurb: string; highlight?: boolean }) {
  return (
    <div className={`card p-7 lg:p-8 min-h-[260px] flex flex-col justify-between fade-up ${highlight ? "ring-1 ring-[rgb(var(--mint)/0.4)]" : ""}`}>
      <div className="flex items-center gap-3 mb-8">
        <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-semibold ${highlight ? "bg-mint text-[#0f0f0f]" : "bg-surface-2 text-fg"}`}>
          {n}
        </span>
        {highlight && <span className="chip chip-mint">On-chain</span>}
      </div>
      <div>
        <h3 className="text-2xl font-semibold tracking-tight mb-3">{title}</h3>
        <p className="text-sm text-fg-muted leading-relaxed">{blurb}</p>
      </div>
    </div>
  );
}

function BenefitsCard({
  eyebrow, title, items, tone,
}: { eyebrow: string; title: string; items: [string, string][]; tone?: "mint" }) {
  return (
    <div className={`${tone === "mint" ? "card-mint" : "card"} p-8 lg:p-10`}>
      <div className={`section-eyebrow mb-2 ${tone === "mint" ? "text-[#0f0f0f]/60" : ""}`}>{eyebrow}</div>
      <h3 className={`text-2xl lg:text-3xl font-semibold tracking-tight mb-6 ${tone === "mint" ? "text-[#0f0f0f]" : ""}`}>{title}</h3>
      <div className={`divide-y ${tone === "mint" ? "divide-[#0f0f0f]/10" : "divide-edge"}`}>
        {items.map(([t, d]) => (
          <div key={t} className="py-4 first:pt-0 last:pb-0">
            <div className={`text-base font-medium mb-1 ${tone === "mint" ? "text-[#0f0f0f]" : ""}`}>{t}</div>
            <div className={`text-sm leading-relaxed ${tone === "mint" ? "text-[#0f0f0f]/70" : "text-fg-muted"}`}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UseCase({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card p-6 min-h-[180px] flex flex-col justify-between card-hover">
      <div className="w-10 h-10 rounded-2xl bg-surface-2 flex items-center justify-center mb-3">
        <span className="w-2 h-2 rounded-full bg-mint" />
      </div>
      <div>
        <div className="text-base font-semibold mb-1.5">{title}</div>
        <div className="text-xs text-fg-muted leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}
