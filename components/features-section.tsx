import {
  Shield,
  Zap,
  Users,
  TrendingUp,
  Twitter,
  ArrowRight,
} from "lucide-react";

export function FeaturesSection() {
  return (
    <div className="relative">
      {/* How It Works Section */}
      <section className="relative py-32 px-4 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-light text-white mb-8">
              From Awareness to Action—Inside Twitter
            </h2>
            <p className="text-white/80 text-xl max-w-4xl mx-auto leading-relaxed">
              Instead of running ads and hoping users click away to complete
              steps (leading to drop-offs), let users take verified actions
              directly within their Twitter feed.
            </p>
          </div>

          {/* Three Step Process */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-3xl font-light text-blue-300">01</span>
              </div>
              <h3 className="text-2xl font-medium text-white mb-6">
                Choose an Intent
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                Select from KYC status checks, loyalty verification, on-chain
                achievements, or any Moca-issued identity proof for your
                campaign.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-3xl font-light text-blue-300">02</span>
              </div>
              <h3 className="text-2xl font-medium text-white mb-6">
                Frame Triggers Proof
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                Users already have their identity and credentials from Moca
                Identity. We verify the proof on-demand, seamlessly inside the
                Frame.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-3xl font-light text-blue-300">03</span>
              </div>
              <h3 className="text-2xl font-medium text-white mb-6">
                Unlock Action
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                Once verified, users can instantly apply, register, claim,
                participate, or join—all without leaving Twitter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-32 px-4 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-12">
              <div>
                <h3 className="text-3xl font-medium text-white mb-8 flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-xl flex items-center justify-center mr-4 border border-green-500/20">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  Why Businesses Love It
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      title: "No Redirect Drop-offs",
                      desc: "Keep users engaged within their natural social environment",
                    },
                    {
                      title: "Frictionless Conversion Funnel",
                      desc: "Eliminate multiple steps and form abandonment",
                    },
                    {
                      title: "Higher Engagement from Social Context",
                      desc: "Leverage the power of social proof and community",
                    },
                    {
                      title: "Proof-based Qualification in Real Time",
                      desc: "Instant verification without manual processes",
                    },
                    {
                      title: "On-chain Trust Layer with Moca Identity",
                      desc: "Cryptographic proof of identity and credentials",
                    },
                    {
                      title: "Customizable Intents for Different Campaigns",
                      desc: "Tailor verification requirements to your needs",
                    },
                  ].map((benefit, index) => (
                    <div key={index} className="group">
                      <h4 className="text-white font-medium text-lg mb-2 group-hover:text-blue-300 transition-colors">
                        {benefit.title}
                      </h4>
                      <p className="text-white/70 leading-relaxed">
                        {benefit.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <h3 className="text-3xl font-medium text-white mb-8 flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-purple-600/30 rounded-xl flex items-center justify-center mr-4 border border-purple-500/20">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  Why Users Love It
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      title: "Already Verified via Moca",
                      desc: "No need to re-enter personal information or documents",
                    },
                    {
                      title: "No Extra Steps Required",
                      desc: "One-click verification and action completion",
                    },
                    {
                      title: "One-click Social Interaction",
                      desc: "Seamless integration with their Twitter experience",
                    },
                    {
                      title: "Instant Gratification",
                      desc: "Immediate results without waiting or redirects",
                    },
                    {
                      title: "Stay in Favorite Platform",
                      desc: "Never leave the comfort of their social feed",
                    },
                    {
                      title: "Seamless Social Experience",
                      desc: "Actions feel native to the Twitter environment",
                    },
                  ].map((benefit, index) => (
                    <div key={index} className="group">
                      <h4 className="text-white font-medium text-lg mb-2 group-hover:text-purple-300 transition-colors">
                        {benefit.title}
                      </h4>
                      <p className="text-white/70 leading-relaxed">
                        {benefit.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative py-32 px-4 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-medium text-white mb-8">
              Example Intents
            </h3>
            <p className="text-white/80 text-xl max-w-3xl mx-auto">
              Choose from these popular verification intents or create custom
              ones for your specific business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Check KYC Status",
                desc: "Verify identity compliance and regulatory requirements",
              },
              {
                icon: Users,
                title: "Verify Loyalty",
                desc: "Confirm membership status and reward eligibility",
              },
              {
                icon: Zap,
                title: "On-chain Achievements",
                desc: "Validate blockchain credentials and NFT ownership",
              },
              {
                icon: Twitter,
                title: "Social Verification",
                desc: "Prove social engagement and community participation",
              },
            ].map((useCase, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <useCase.icon className="h-8 w-8 text-blue-400" />
                </div>
                <h4 className="text-white font-medium text-xl mb-4">
                  {useCase.title}
                </h4>
                <p className="text-white/70 leading-relaxed">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-16">
            <h3 className="text-4xl font-medium text-white mb-6">
              Ready to Convert Users Inside Twitter?
            </h3>
            <p className="text-white/80 text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
              Join forward-thinking businesses using Moink to turn social
              attention into verified actions with Moca Identitys trust layer.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="bg-blue-500/90 hover:bg-blue-500 border border-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 px-10 py-4 rounded-xl font-medium text-lg flex items-center justify-center">
                Start Building Frames
                <ArrowRight className="ml-3 h-5 w-5" />
              </button>
              <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 px-10 py-4 rounded-xl font-medium text-lg">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
