"use client";

import { Sparkles } from "lucide-react";

interface ProcessingOverlayProps {
  stage: string;
}

export default function ProcessingOverlay({ stage }: ProcessingOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[32px] bg-slate-950/70 backdrop-blur-sm">
      <div className="rounded-3xl border border-cyan-400/30 bg-slate-900/80 px-6 py-5 text-center shadow-[0_20px_80px_rgba(34,211,238,0.16)]">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-cyan-200">Working on your document</p>
        <p className="mt-1 text-sm text-gray-400">{stage || "Preparing the next step"}</p>
      </div>
    </div>
  );
}
