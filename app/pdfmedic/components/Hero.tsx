"use client";

import { FileText, Lock, Zap } from "lucide-react";

import FadeIn from "@/components/animations/FadeIn";
import SlideUp from "@/components/animations/SlideUp";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import GlassCard from "@/components/ui/GlassCard";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden pt-20"
    >
      <Container>
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <FadeIn>
              <Badge>PDFMedic by Zerodoxa</Badge>
            </FadeIn>

            <SlideUp delay={0.1}>
              <h1 className="mt-8 text-5xl font-black leading-tight text-white md:text-7xl">
                Heal Every
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                  PDF Workflow.
                </span>
              </h1>
            </SlideUp>

            <SlideUp delay={0.2}>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-gray-400 md:text-xl">
                Compress, merge, split, convert and organize PDFs with a fast
                workspace designed for secure document handling.
              </p>
            </SlideUp>

            <SlideUp delay={0.3}>
              <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                <Button variant="primary">Start PDF Repair</Button>
                <Button variant="secondary">Explore Tools</Button>
              </div>
            </SlideUp>
          </div>

          <SlideUp delay={0.25}>
            <GlassCard className="mx-auto w-full max-w-md">
              <div className="flex h-[360px] flex-col justify-between rounded-[24px] border border-white/10 bg-[#020617]/70 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20">
                    <FileText className="h-7 w-7 text-blue-400" />
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
                    Ready
                  </span>
                </div>

                <div>
                  <div className="mb-4 h-3 w-24 rounded-full bg-white/20" />
                  <div className="space-y-3">
                    <div className="h-3 rounded-full bg-white/10" />
                    <div className="h-3 w-10/12 rounded-full bg-white/10" />
                    <div className="h-3 w-8/12 rounded-full bg-white/10" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <Zap className="mb-3 h-5 w-5 text-yellow-400" />
                    <p className="text-sm text-gray-300">Fast processing</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <Lock className="mb-3 h-5 w-5 text-emerald-400" />
                    <p className="text-sm text-gray-300">Secure by design</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </SlideUp>
        </div>
      </Container>
    </section>
  );
}
