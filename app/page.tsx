"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturesSection } from "@/components/features-section";
import { TransparentNavbar } from "@/components/TransparentNavbar";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 -z-10">
        {/* Main radial gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, #2d4663 0%, #1a2b42 50%, #0a1628 100%)",
          }}
        />

        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3Cfilter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Enhanced Space Animation Video Background */}
      <div className="fixed inset-0 -z-5">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          style={{
            filter: "brightness(0.9) contrast(1.1) saturate(1.2)",
          }}
        >
          <source src="/space.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dynamic overlay that pulses with the animation */}
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(45, 70, 99, 0.1) 0%, rgba(26, 43, 66, 0.3) 50%, rgba(10, 22, 40, 0.4) 100%)",
            animationDuration: "4s",
          }}
        />
      </div>

      {/* Navigation */}
      <TransparentNavbar />

      {/* Hero Section */}
      <main className="relative z-10 min-h-screen flex items-center py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Hero Content - Centered */}
            <div className="text-center">
              {/* Main Headline with enhanced styling */}
              <h1
                className="text-white font-light leading-tight tracking-tight mb-8 relative"
                style={{
                  fontSize: "clamp(3rem, 6vw, 5rem)",
                  lineHeight: "1.1",
                  letterSpacing: "-0.02em",
                  background:
                    "linear-gradient(90deg, #ffffff 0%, #e2e8f0 50%, #ffffff 100%)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer 3s ease-in-out infinite",
                }}
              >
                Stop Sending Users Away—Convert Them Inside Twitter
              </h1>

              {/* Supporting Text */}
              <p
                className="text-white/80 mb-12 max-w-4xl mx-auto"
                style={{
                  fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
                  lineHeight: "1.6",
                }}
              >
                Let users instantly prove their identity or eligibility using
                their existing Moca-issued credentials—without ever leaving
                their social feed. More engagement. Less friction. Higher
                conversions.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/builder">
                  <Button
                    size="lg"
                    className="bg-blue-500/90 hover:bg-blue-500 border border-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 px-10 py-4 text-lg font-medium"
                  >
                    Start Creating Frames
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </Link>

                <Link
                  href="https://x.com/IdeaManPaul/status/1939620719765389818"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 px-10 py-4 text-lg font-medium"
                  >
                    See Demo Frame
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <FeaturesSection />

      {/* Subtle glow effects */}
      <div className="fixed inset-0 -z-6 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>
    </div>
  );
}
