"use client";

import { Download, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

interface OrganizeControlsProps {
  /** Number of pages still in the active layout. */
  pageCount: number;
  /** Whether an API request is in flight. */
  isLoading: boolean;
  /** Blob of the last successfully generated PDF (enables "Download Again"). */
  downloadBlob: Blob | null;
  /** Suggested filename for re-downloads. */
  downloadName: string;
  /** Called when the user requests a new PDF to be generated. */
  onSubmit: () => void;
}

export default function OrganizeControls({
  pageCount,
  isLoading,
  downloadBlob,
  downloadName,
  onSubmit,
}: OrganizeControlsProps) {
  const handleDownloadAgain = () => {
    if (!downloadBlob) return;
    const url = URL.createObjectURL(downloadBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
      {/* Primary: generate / download */}
      <Button
        id="organize-submit-btn"
        disabled={isLoading || pageCount === 0}
        onClick={onSubmit}
        className="w-full sm:w-auto min-w-[220px]"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Saving…
          </span>
        ) : (
          "Save & Download PDF"
        )}
      </Button>

      {/* Secondary: re-download previously generated PDF */}
      {downloadBlob && !isLoading && (
        <button
          id="organize-download-again-btn"
          type="button"
          onClick={handleDownloadAgain}
          aria-label="Download the previously generated PDF again"
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/5 px-6 py-3 font-semibold text-violet-300 transition hover:bg-violet-500/10 hover:border-violet-500"
        >
          <Download className="h-5 w-5" />
          Download Again
        </button>
      )}
    </div>
  );
}
