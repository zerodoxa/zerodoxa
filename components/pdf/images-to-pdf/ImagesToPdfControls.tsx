"use client";

import { FileImage } from "lucide-react";
import Button from "@/components/ui/Button";
import type { PageSize, Orientation, MarginSize } from "@/types/pdf";

interface ImagesToPdfControlsProps {
  pageSize: PageSize;
  orientation: Orientation;
  margin: MarginSize;
  imageCount: number;
  isConverting: boolean;
  onPageSizeChange: (v: PageSize) => void;
  onOrientationChange: (v: Orientation) => void;
  onMarginChange: (v: MarginSize) => void;
  onConvert: () => void;
}

export default function ImagesToPdfControls({
  pageSize,
  orientation,
  margin,
  imageCount,
  isConverting,
  onPageSizeChange,
  onOrientationChange,
  onMarginChange,
  onConvert,
}: ImagesToPdfControlsProps) {
  return (
    <div className="mt-8 rounded-3xl border border-gray-800 bg-black/25 p-6 text-left backdrop-blur-xl">
      <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-white">
        <FileImage className="h-4 w-4 text-pink-400" />
        PDF Settings
      </h3>

      <div className="grid gap-6 sm:grid-cols-3">
        {/* Page Size */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400">
            Page Size
          </label>
          <div className="flex gap-2">
            {(["A4", "Letter"] as PageSize[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onPageSizeChange(s)}
                className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition ${
                  pageSize === s
                    ? "border-pink-500 bg-pink-500/15 text-pink-300"
                    : "border-gray-700 bg-black/20 text-gray-400 hover:border-gray-600 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Orientation */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400">
            Orientation
          </label>
          <div className="flex gap-2">
            {(["portrait", "landscape"] as Orientation[]).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => onOrientationChange(o)}
                className={`flex-1 rounded-xl border py-2 text-sm font-semibold capitalize transition ${
                  orientation === o
                    ? "border-pink-500 bg-pink-500/15 text-pink-300"
                    : "border-gray-700 bg-black/20 text-gray-400 hover:border-gray-600 hover:text-white"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Margin */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400">
            Margin
          </label>
          <div className="flex gap-1.5">
            {(["none", "small", "medium", "large"] as MarginSize[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onMarginChange(m)}
                className={`flex-1 rounded-xl border py-2 text-xs font-semibold capitalize transition ${
                  margin === m
                    ? "border-pink-500 bg-pink-500/15 text-pink-300"
                    : "border-gray-700 bg-black/20 text-gray-400 hover:border-gray-600 hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Convert Button */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-400">
          {imageCount} image{imageCount !== 1 ? "s" : ""} → {imageCount}-page PDF
        </p>
        <Button
          onClick={onConvert}
          disabled={isConverting || imageCount === 0}
          className="min-w-[200px] bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 hover:shadow-[0_8px_30px_rgba(236,72,153,0.3)]"
        >
          {isConverting ? "Converting..." : "Convert to PDF"}
        </Button>
      </div>
    </div>
  );
}
