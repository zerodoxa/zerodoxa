"use client";

import { useState } from "react";
import { RotateCw, Download, RefreshCw } from "lucide-react";
import PDFUpload from "@/components/pdf/PDFUpload";
import RotatePreview from "@/components/pdf/RotatePreview";
import RotateControls from "@/components/pdf/RotateControls";
import SuccessAlert from "@/components/pdf/SuccessAlert";
import ErrorAlert from "@/components/pdf/ErrorAlert";

export default function RotatePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [pageCount, setPageCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string | null>(null);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setError("");
    setSuccess("");
    resetState();
  };

  const handleFileRemoved = () => {
    setFile(null);
    setError("");
    setSuccess("");
    resetState();
  };

  const resetState = () => {
    setSelectedPages([]);
    setPageRotations({});
    setPageCount(0);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    setDownloadName(null);
  };

  const handleLoad = (count: number) => {
    setPageCount(count);
    // Select all pages by default for bulk rotation convenience
    setSelectedPages(Array.from({ length: count }).map((_, i) => i));
  };

  const handleTogglePage = (pageIdx: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageIdx)
        ? prev.filter((idx) => idx !== pageIdx)
        : [...prev, pageIdx]
    );
  };

  const handleRotatePage = (pageIdx: number, direction: "cw" | "ccw") => {
    setPageRotations((prev) => {
      const current = prev[pageIdx] ?? 0;
      let next = direction === "cw" ? current + 90 : current - 90;
      next = ((next % 360) + 360) % 360;
      return { ...prev, [pageIdx]: next };
    });
  };

  const handleSelectAll = () => {
    setSelectedPages(Array.from({ length: pageCount }).map((_, i) => i));
  };

  const handleSelectNone = () => {
    setSelectedPages([]);
  };

  const handleRotateSelected = (angleDelta: 90 | 180 | 270) => {
    setPageRotations((prev) => {
      const next = { ...prev };
      selectedPages.forEach((pageIdx) => {
        const curr = prev[pageIdx] ?? 0;
        const newVal = ((curr + angleDelta) % 360 + 360) % 360;
        next[pageIdx] = newVal;
      });
      return next;
    });
  };

  const handleResetAll = () => {
    setPageRotations({});
  };

  // Check if any pages have non-zero rotation adjustments
  const hasRotations = Object.values(pageRotations).some((val) => val !== 0);

  const handleRotateSubmit = async () => {
    if (!file) {
      setError("Please choose a PDF file first.");
      return;
    }

    const filteredRotations: Record<number, number> = {};
    Object.entries(pageRotations).forEach(([idxStr, val]) => {
      const valNormalized = val % 360;
      if (valNormalized !== 0) {
        filteredRotations[Number(idxStr)] = valNormalized;
      }
    });

    if (Object.keys(filteredRotations).length === 0) {
      setError("Please rotate at least one page first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("rotations", JSON.stringify(filteredRotations));

      const response = await fetch("/api/pdf/rotate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to rotate PDF.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const originalName = file.name.replace(/\.pdf$/i, "");
      const finalName = `${originalName}-rotated.pdf`;

      setDownloadUrl(url);
      setDownloadName(finalName);

      // Trigger download automatically
      const link = document.createElement("a");
      link.href = url;
      link.download = finalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess("PDF rotated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="group mx-auto max-w-5xl rounded-4xl border border-dashed border-sky-400/40 bg-white/5 p-6 text-center backdrop-blur-xl transition-all duration-300 md:p-12">
        
        {/* Header Icon & Text */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-sky-600/20 transition-all duration-300 md:h-28 md:w-28 group-hover:scale-105">
          <RotateCw className="h-12 w-12 text-sky-400 md:h-14 md:w-14" />
        </div>

        <h2 className="mt-8 text-3xl font-extrabold text-white md:text-5xl">Rotate PDF</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-400">
          Rotate individual or multiple pages in your PDF document simultaneously.
        </p>

        {/* Upload component */}
        <div className="mt-10">
          <PDFUpload
            disabled={loading}
            onFileSelected={handleFileSelected}
            onFileRemoved={handleFileRemoved}
          />
        </div>

        {/* Preview and Controls */}
        {file && !loading && !downloadUrl && (
          <>
            <RotateControls
              selectedCount={selectedPages.length}
              totalCount={pageCount}
              isRotating={loading}
              hasRotations={hasRotations}
              onSelectAll={handleSelectAll}
              onSelectNone={handleSelectNone}
              onRotateSelected={handleRotateSelected}
              onResetAll={handleResetAll}
              onSubmit={handleRotateSubmit}
            />

            <RotatePreview
              file={file}
              selectedPages={selectedPages}
              pageRotations={pageRotations}
              onTogglePage={handleTogglePage}
              onRotatePage={handleRotatePage}
              onLoad={handleLoad}
            />
          </>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="mt-10 py-16 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-sky-500/20 border-t-sky-500" />
              <RotateCw className="absolute h-6 w-6 animate-pulse text-sky-400" />
            </div>
            <p className="mt-6 text-lg font-semibold text-white animate-pulse">Rotating PDF pages...</p>
            <p className="mt-2 text-sm text-gray-400">Applying absolute orientation values and writing output</p>
          </div>
        )}

        {/* Action Success Box */}
        {downloadUrl && downloadName && !loading && (
          <div className="mt-10 rounded-3xl border border-sky-500/20 bg-sky-950/10 p-8 text-left max-w-md mx-auto shadow-lg backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-4">PDF Processed</h3>
            <p className="text-sm text-gray-400 mb-6">
              Your rotated PDF is ready. If the download did not start automatically, click the button below.
            </p>

            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = downloadUrl;
                  link.download = downloadName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 font-semibold text-white transition hover:bg-sky-700"
              >
                <Download className="h-5 w-5" />
                Download Rotated PDF
              </button>

              <button
                type="button"
                onClick={resetState}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-transparent py-3 font-semibold text-sky-300 transition hover:bg-sky-500/5 hover:border-sky-500"
              >
                <RefreshCw className="h-4 w-4" />
                Rotate Again / Adjust
              </button>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && <SuccessAlert message={success} />}

        {/* Error Alert */}
        {error && <ErrorAlert message={error} />}

      </div>
    </div>
  );
}