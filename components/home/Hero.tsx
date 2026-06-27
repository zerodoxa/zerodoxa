"use client";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import GlassCard from "@/components/ui/GlassCard";

import FadeIn from "@/components/animations/FadeIn";
import SlideUp from "@/components/animations/SlideUp";

import { ShieldCheck, Zap, Globe, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-28 lg:pt-32"
    >
      <Container>
        <div className="mx-auto max-w-6xl text-center">

          <FadeIn>
            <Badge>🚀 Simplifying Every File</Badge>
          </FadeIn>

          <SlideUp delay={0.1}>
            <h1 className="mx-auto mt-6 max-w-5xl text-4xl font-black leading-[0.95] text-white sm:mt-8 sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
              One Platform.
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                Every File Tool.
              </span>
            </h1>
          </SlideUp>

          <SlideUp delay={0.2}>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-gray-400 sm:mt-8 sm:text-lg sm:leading-8 md:text-xl">
              Convert, compress, merge, organize, OCR, edit and manage PDFs,
              images, videos and documents from one fast, secure and modern
              platform.
            </p>
          </SlideUp>

          <SlideUp delay={0.3}>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <Button variant="primary" className="w-full sm:w-auto transition-transform duration-300 ease-out hover:scale-[1.01] sm:hover:scale-[1.02]">
                🚀 Explore Tools
              </Button>

              <Button variant="secondary" className="w-full sm:w-auto transition-transform duration-300 ease-out hover:scale-[1.01] sm:hover:scale-[1.02]">
                🌍 View Ecosystem
              </Button>
            </div>
          </SlideUp>

          <SlideUp delay={0.4}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-400 sm:mt-14 sm:gap-6 md:gap-8">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-green-400 sm:h-5 sm:w-5" />
                Privacy First
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Zap className="h-4 w-4 text-yellow-400 sm:h-5 sm:w-5" />
                Lightning Fast
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Globe className="h-4 w-4 text-cyan-400 sm:h-5 sm:w-5" />
                Cloud Powered
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Sparkles className="h-4 w-4 text-violet-400 sm:h-5 sm:w-5" />
                AI Ready
              </div>
            </div>
          </SlideUp>

          <SlideUp delay={0.5}>
            <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
              <GlassCard>
                <h3 className="text-3xl font-bold text-white sm:text-4xl">25+</h3>
                <p className="mt-2 text-sm text-gray-400 sm:text-base">Upcoming Tools</p>
              </GlassCard>

              <GlassCard>
                <h3 className="text-3xl font-bold text-white sm:text-4xl">100%</h3>
                <p className="mt-2 text-sm text-gray-400 sm:text-base">Secure Processing</p>
              </GlassCard>

              <GlassCard>
                <h3 className="text-3xl font-bold text-white sm:text-4xl">24/7</h3>
                <p className="mt-2 text-sm text-gray-400 sm:text-base">Cloud Availability</p>
              </GlassCard>

              <GlassCard>
                <h3 className="text-3xl font-bold text-white sm:text-4xl">Global</h3>
                <p className="mt-2 text-sm text-gray-400 sm:text-base">Access Anywhere</p>
              </GlassCard>
            </div>
          </SlideUp>

        </div>
      </Container>
    </section>
  );
}