"use client";

import { Scissors, AlertCircle, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { parsePages } from "@/lib/pdf/validation";

interface ExtractControlsProps {
  pages: string;
  onChange: (value: string) => void;
  totalCount: number;
  isExtracting: boolean;
  onSubmit: () => void;
}

export default function ExtractControls({
  pages,
  onChange,
  totalCount,
  isExtracting,
  onSubmit,
}: ExtractControlsProps) {
  // Real-time validation inside the UI (runs synchronously during render)
  const { pagesToDelete: pagesToExtract, errors: localErrors } = pages.trim()
    ? parsePages(pages, totalCount)
    : { pagesToDelete: new Set<number>(), errors: [] };

  const validCount = pagesToExtract.size;
  const hasErrors = localErrors.length > 0;
  const isSubmitDisabled = isExtracting || hasErrors || !pages.trim();

  return (
    <div className="mt-8 flex flex-col gap-6 rounded-3xl border border-gray-800 bg-black/25 p-6 text-left max-w-xl mx-auto">
      
      {/* Description */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Scissors className="h-5 w-5 text-blue-400" />
          Specify Pages to Extract
        </h3>
        <p className="text-sm text-gray-400">
          Enter page numbers or ranges to include in the new document.
        </p>
      </div>

      <hr className="border-gray-800" />

      {/* Text Input */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase block">
          Pages / Ranges List
        </label>
        
        <input
          type="text"
          value={pages}
          disabled={isExtracting}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 1, 3, 5-8, 12"
          className={`w-full rounded-xl border bg-black/40 px-4 py-3.5 text-white placeholder-gray-600 outline-none transition duration-300 ${
            hasErrors
              ? "border-rose-500/50 focus:border-rose-500 focus:shadow-[0_0_15px_rgba(244,63,94,0.1)]"
              : pages.trim()
              ? "border-emerald-500/50 focus:border-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              : "border-gray-800 focus:border-blue-500/70"
          }`}
        />

        {/* Examples / Hints */}
        <div className="rounded-xl bg-white/5 p-3 text-xs text-gray-400 space-y-1">
          <p className="font-semibold text-gray-300">Supported formats:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li><code className="text-blue-300 font-semibold">1</code> — extracts the first page only</li>
            <li><code className="text-blue-300 font-semibold">1,3,5</code> — extracts pages 1, 3, and 5</li>
            <li><code className="text-blue-300 font-semibold">4-10</code> — extracts pages 4 through 10 inclusive</li>
            <li><code className="text-blue-300 font-semibold">1,5-8,11</code> — extracts page 1, pages 5 to 8, and page 11</li>
          </ul>
        </div>
      </div>

      {/* Validation feedback */}
      {pages.trim() && (
        <div className="transition-all duration-300">
          {hasErrors ? (
            <div className="flex gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-rose-300 text-xs">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <div className="space-y-1">
                {localErrors.map((err, idx) => (
                  <p key={idx}>{err}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-300 text-xs">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
              <p>
                Valid selection. Will extract <strong>{validCount}</strong> page{validCount === 1 ? "" : "s"} into the new PDF.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-2 flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className="w-full sm:w-auto min-w-[180px] bg-blue-600 hover:bg-blue-700 hover:shadow-[0_10px_30px_rgba(37,99,235,0.25)] text-white"
        >
          {isExtracting ? "Extracting Pages..." : "Extract Pages"}
        </Button>
      </div>
    </div>
  );
}
