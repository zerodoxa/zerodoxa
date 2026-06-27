"use client";

import { Files, Sparkles, Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";

interface MergeControlsProps {
  selectedCount: number;
  isMerging: boolean;
  onMerge: () => void;
  onClear: () => void;
}

export default function MergeControls({ selectedCount, isMerging, onMerge, onClear }: MergeControlsProps) {
  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:flex-row">
      <div className="text-sm text-gray-300">
        <p className="font-semibold text-white">{selectedCount} PDF{selectedCount === 1 ? "" : "s"} selected</p>
        <p className="mt-1 text-xs text-gray-400">Merge into one downloadable PDF.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onClear}
          disabled={selectedCount === 0 || isMerging}
        >
          <span className="inline-flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Clear All
          </span>
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={onMerge}
          disabled={selectedCount < 2 || isMerging}
        >
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {isMerging ? "Merging..." : "Merge PDFs"}
          </span>
        </Button>
      </div>
    </div>
  );
}
