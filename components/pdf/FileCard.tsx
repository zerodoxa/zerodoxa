"use client";

import { FileCheck2, FileX2, RefreshCw, Trash2 } from "lucide-react";

import { formatFileSize } from "@/lib/pdf/validation";
import type { UploadedPDF } from "@/types/pdf";

interface FileCardProps {
  uploadedFile: UploadedPDF;
  onReplace: () => void;
  onRemove: () => void;
}

export default function FileCard({ uploadedFile, onReplace, onRemove }: FileCardProps) {
  return (
    <div className="mx-auto mt-6 flex max-w-2xl flex-col items-center justify-between gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-emerald-300 sm:flex-row">
      <div className="flex items-center gap-3 text-left">
        <FileCheck2 className="h-5 w-5 shrink-0" />
        <div>
          <p className="max-w-full truncate text-sm font-medium">{uploadedFile.name}</p>
          <p className="text-xs text-emerald-200/80">
            {formatFileSize(uploadedFile.size)}{uploadedFile.pages ? ` • ${uploadedFile.pages} pages` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReplace}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-white/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-white/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Replace
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>
    </div>
  );
}
