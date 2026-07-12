"use client";

import { ImageIcon, Monitor, Printer, Zap } from "lucide-react";

export interface PdfToImagesControlsProps {
  format: "png" | "jpeg";
  dpi: number;
  isConverting: boolean;
  onFormatChange: (format: "png" | "jpeg") => void;
  onDpiChange: (dpi: number) => void;
  onSubmit: () => void;
}

export default function PdfToImagesControls({
  format,
  dpi,
  isConverting,
  onFormatChange,
  onDpiChange,
  onSubmit,
}: PdfToImagesControlsProps) {
  return (
    <div className="mt-8 mx-auto max-w-2xl rounded-3xl border border-gray-800 bg-black/20 p-6 backdrop-blur-md">
      <div className="grid gap-6 md:grid-cols-2 text-left">
        {/* Format Selection */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-gray-400">Output Format</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onFormatChange("jpeg")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 font-medium transition-all ${
                format === "jpeg"
                  ? "border-violet-500 bg-violet-500/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                  : "border-gray-800 bg-black/40 text-gray-400 hover:border-gray-700 hover:bg-gray-900"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              JPEG
            </button>
            <button
              type="button"
              onClick={() => onFormatChange("png")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 font-medium transition-all ${
                format === "png"
                  ? "border-violet-500 bg-violet-500/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                  : "border-gray-800 bg-black/40 text-gray-400 hover:border-gray-700 hover:bg-gray-900"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              PNG
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {format === "jpeg" ? "Smaller file size, good for photos." : "Lossless quality, good for text and graphics."}
          </p>
        </div>

        {/* DPI Selection */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-gray-400">Image Quality (DPI)</label>
          <div className="flex flex-col gap-2">
            {[
              { value: 72, label: "Web (72 DPI)", icon: Zap, desc: "Fastest, smallest size" },
              { value: 150, label: "Standard (150 DPI)", icon: Monitor, desc: "Good balance" },
              { value: 300, label: "Print (300 DPI)", icon: Printer, desc: "High quality, large size" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onDpiChange(option.value)}
                className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                  dpi === option.value
                    ? "border-violet-500 bg-violet-500/10 text-white"
                    : "border-gray-800 bg-black/40 text-gray-400 hover:border-gray-700 hover:bg-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <option.icon className={`h-4 w-4 ${dpi === option.value ? "text-violet-400" : "text-gray-500"}`} />
                  <span className="font-medium text-sm">{option.label}</span>
                </div>
                <span className="text-xs opacity-60 hidden sm:inline-block">{option.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={onSubmit}
          disabled={isConverting}
          className="group relative flex w-full max-w-sm items-center justify-center gap-3 overflow-hidden rounded-2xl bg-violet-600 px-8 py-4 font-bold text-white shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all hover:bg-violet-500 hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:pointer-events-none active:scale-95"
        >
          <span className="relative z-10 text-lg tracking-wide">
            {isConverting ? "Converting..." : "Convert & Download ZIP"}
          </span>
          <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 bg-[length:200%_100%] opacity-0 transition-opacity duration-500 group-hover:animate-shimmer group-hover:opacity-100" />
        </button>
      </div>
    </div>
  );
}
