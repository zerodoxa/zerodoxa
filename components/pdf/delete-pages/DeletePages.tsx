"use client";

import { useState } from "react";
import { Trash2, Download, RefreshCw } from "lucide-react";
import PDFUpload from "@/components/pdf/PDFUpload";
import DeleteControls from "@/components/pdf/delete-pages/DeleteControls";
import SuccessAlert from "@/components/pdf/SuccessAlert";
import ErrorAlert from "@/components/pdf/ErrorAlert";
import { extractPdfMetadata } from "@/services/pdf/metadataService";

export default function DeletePages() {
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

  const handleDeleteSubmit = async () => {
    if (!file) {
      setError("Please choose a PDF file first.");
      return;
    }

    if (!pages.trim()) {
      setError("Please enter pages to delete.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pages", pages);

      const response = await fetch("/api/pdf/delete-pages", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete pages.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const originalName = file.name.replace(/\.pdf$/i, "");
      const finalName = `${originalName}-pages-deleted.pdf`;

      setDownloadUrl(url);
      setDownloadName(finalName);

      // Trigger download automatically
      const link = document.createElement("a");
      link.href = url;
      link.download = finalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess("Pages deleted successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="group mx-auto max-w-5xl rounded-4xl border border-dashed border-rose-400/40 bg-white/5 p-6 text-center backdrop-blur-xl transition-all duration-300 md:p-12">
        
        {/* Header Icon & Text */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-rose-600/20 transition-all duration-300 md:h-28 md:w-28 group-hover:scale-105">
          <Trash2 className="h-12 w-12 text-rose-400 md:h-14 md:w-14" />
        </div>

        <h2 className="mt-8 text-3xl font-extrabold text-white md:text-5xl">Delete PDF Pages</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-400">
          Remove unwanted or redundant pages from your PDF documents instantly.
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
          <div className="mt-6 flex items-center justify-center gap-2 text-rose-300 text-sm">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500/20 border-t-rose-500" />
            Reading PDF page metrics...
          </div>
        )}

        {/* Controls and Input */}
        {file && !loading && !loadingMetadata && !downloadUrl && pageCount > 0 && (
          <DeleteControls
            pages={pages}
            onChange={setPages}
            totalCount={pageCount}
            isDeleting={loading}
            onSubmit={handleDeleteSubmit}
          />
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="mt-10 py-16 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-rose-500/20 border-t-rose-500" />
              <Trash2 className="absolute h-6 w-6 animate-pulse text-rose-400" />
            </div>
            <p className="mt-6 text-lg font-semibold text-white animate-pulse">Deleting pages...</p>
            <p className="mt-2 text-sm text-gray-400">Rearranging PDF structure and copying selected pages</p>
          </div>
        )}

        {/* Action Success Box */}
        {downloadUrl && downloadName && !loading && (
          <div className="mt-10 rounded-3xl border border-rose-500/20 bg-rose-950/10 p-8 text-left max-w-md mx-auto shadow-lg backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-4">PDF Processed</h3>
            <p className="text-sm text-gray-400 mb-6">
              Your cleaned PDF has been created. If the download did not start automatically, click the button below.
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 font-semibold text-white transition hover:bg-rose-700"
              >
                <Download className="h-5 w-5" />
                Download Cleaned PDF
              </button>

              <button
                type="button"
                onClick={resetState}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-transparent py-3 font-semibold text-rose-300 transition hover:bg-rose-500/5 hover:border-rose-500"
              >
                <RefreshCw className="h-4 w-4" />
                Delete More Pages / Reset
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