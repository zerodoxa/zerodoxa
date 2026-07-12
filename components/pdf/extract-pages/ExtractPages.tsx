"use client";

import { useState } from "react";
import { Scissors, Download, RefreshCw } from "lucide-react";
import PDFUpload from "@/components/pdf/PDFUpload";
import ExtractControls from "@/components/pdf/extract-pages/ExtractControls";
import SuccessAlert from "@/components/pdf/SuccessAlert";
import ErrorAlert from "@/components/pdf/ErrorAlert";
import { extractPdfMetadata } from "@/services/pdf/metadataService";

export default function ExtractPages() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState("");
  const [pageCount, setPageCount] = useState(0);

  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string | null>(null);

  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setError("");
    setSuccess("");
    resetState();

    setLoadingMetadata(true);
    try {
      const meta = await extractPdfMetadata(selectedFile);
      if (meta.success && meta.metadata) {
        setPageCount(meta.metadata.pageCount ?? 0);
      } else {
        setError(meta.error || "Failed to load PDF metadata.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to read PDF page count.");
    } finally {
      setLoadingMetadata(false);
    }
  };

  const handleFileRemoved = () => {
    setFile(null);
    setError("");
    setSuccess("");
    resetState();
  };

  const resetState = () => {
    setPages("");
    setPageCount(0);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    setDownloadName(null);
  };

  const handleExtractSubmit = async () => {
    if (!file) {
      setError("Please choose a PDF file first.");
      return;
    }

    if (!pages.trim()) {
      setError("Please enter pages to extract.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pages", pages);

      const response = await fetch("/api/pdf/extract-pages", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to extract pages.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const originalName = file.name.replace(/\.pdf$/i, "");
      const finalName = `${originalName}-extracted.pdf`;

      setDownloadUrl(url);
      setDownloadName(finalName);

      // Trigger download automatically
      const link = document.createElement("a");
      link.href = url;
      link.download = finalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess("Pages extracted successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="group mx-auto max-w-5xl rounded-4xl border border-dashed border-blue-400/40 bg-white/5 p-6 text-center backdrop-blur-xl transition-all duration-300 md:p-12">
        
        {/* Header Icon & Text */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-600/20 transition-all duration-300 md:h-28 md:w-28 group-hover:scale-105">
          <Scissors className="h-12 w-12 text-blue-400 md:h-14 md:w-14" />
        </div>

        <h2 className="mt-8 text-3xl font-extrabold text-white md:text-5xl">Extract PDF Pages</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-400">
          Extract specific pages or custom ranges into a brand new PDF file.
        </p>

        {/* Upload component */}
        <div className="mt-10">
          <PDFUpload
            disabled={loading || loadingMetadata}
            onFileSelected={handleFileSelected}
            onFileRemoved={handleFileRemoved}
          />
        </div>

        {/* Metadata spinner */}
        {loadingMetadata && (
          <div className="mt-6 flex items-center justify-center gap-2 text-blue-300 text-sm">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-500" />
            Reading PDF page metrics...
          </div>
        )}

        {/* Controls and Input */}
        {file && !loading && !loadingMetadata && !downloadUrl && pageCount > 0 && (
          <ExtractControls
            pages={pages}
            onChange={setPages}
            totalCount={pageCount}
            isExtracting={loading}
            onSubmit={handleExtractSubmit}
          />
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="mt-10 py-16 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
              <Scissors className="absolute h-6 w-6 animate-pulse text-blue-400" />
            </div>
            <p className="mt-6 text-lg font-semibold text-white animate-pulse">Extracting pages...</p>
            <p className="mt-2 text-sm text-gray-400">Copying selected pages and constructing a new PDF</p>
          </div>
        )}

        {/* Action Success Box */}
        {downloadUrl && downloadName && !loading && (
          <div className="mt-10 rounded-3xl border border-blue-500/20 bg-blue-950/10 p-8 text-left max-w-md mx-auto shadow-lg backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-4">PDF Processed</h3>
            <p className="text-sm text-gray-400 mb-6">
              Your extracted PDF has been created. If the download did not start automatically, click the button below.
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <Download className="h-5 w-5" />
                Download Extracted PDF
              </button>

              <button
                type="button"
                onClick={resetState}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-transparent py-3 font-semibold text-blue-300 transition hover:bg-blue-500/5 hover:border-blue-500"
              >
                <RefreshCw className="h-4 w-4" />
                Extract Again / Reset
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