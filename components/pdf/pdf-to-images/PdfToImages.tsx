"use client";

import { useState } from "react";
import { FileImage, Download, RefreshCw } from "lucide-react";
import PDFUpload from "@/components/pdf/PDFUpload";
import SuccessAlert from "@/components/pdf/SuccessAlert";
import ErrorAlert from "@/components/pdf/ErrorAlert";
import PdfToImagesControls from "./PdfToImagesControls";
import dynamic from "next/dynamic";

const PdfToImagesPreview = dynamic(() => import("./PdfToImagesPreview"), { ssr: false });

export default function PdfToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"png" | "jpeg">("jpeg");
  const [dpi, setDpi] = useState<number>(150);
  const [pageCount, setPageCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
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
    setPageCount(0);
    setDownloadBlob(null);
    setDownloadName(null);
  };

  const handleLoad = (count: number) => {
    setPageCount(count);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please choose a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", format);
      formData.append("dpi", dpi.toString());

      const response = await fetch("/api/pdf/pdf-to-images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to convert PDF to images.");
      }

      const blob = await response.blob();
      const originalName = file.name.replace(/\.pdf$/i, "");
      const finalName = `${originalName}-images.zip`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = finalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadBlob(blob);
      setDownloadName(finalName);
      setSuccess("PDF converted and ZIP downloaded successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="group mx-auto max-w-5xl rounded-4xl border border-dashed border-violet-400/40 bg-white/5 p-6 text-center backdrop-blur-xl transition-all duration-300 md:p-12">
        
        {/* Header Icon & Text */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-violet-600/20 transition-all duration-300 md:h-28 md:w-28 group-hover:scale-105">
          <FileImage className="h-12 w-12 text-violet-400 md:h-14 md:w-14" />
        </div>

        <h2 className="mt-8 text-3xl font-extrabold text-white md:text-5xl">PDF to Images</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-400">
          Extract every page of your PDF into high-quality JPEG or PNG images.
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
        {file && !loading && !downloadBlob && (
          <>
            <PdfToImagesPreview file={file} onLoad={handleLoad} />
            
            {pageCount > 0 && (
              <PdfToImagesControls
                format={format}
                dpi={dpi}
                isConverting={loading}
                onFormatChange={setFormat}
                onDpiChange={setDpi}
                onSubmit={handleSubmit}
              />
            )}
          </>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="mt-10 py-16 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500" />
              <FileImage className="absolute h-6 w-6 animate-pulse text-violet-400" />
            </div>
            <p className="mt-6 text-lg font-semibold text-white animate-pulse">Converting PDF to Images...</p>
            <p className="mt-2 text-sm text-gray-400">This may take a moment for large PDFs.</p>
          </div>
        )}

        {/* Action Success Box */}
        {downloadBlob && downloadName && !loading && (
          <div className="mt-10 rounded-3xl border border-violet-500/20 bg-violet-950/10 p-8 text-left max-w-md mx-auto shadow-lg backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-4">Images Extracted</h3>
            <p className="text-sm text-gray-400 mb-6">
              Your ZIP file is ready. If the download did not start automatically, click the button below.
            </p>

            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => {
                  const url = URL.createObjectURL(downloadBlob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = downloadName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700"
              >
                <Download className="h-5 w-5" />
                Download ZIP Again
              </button>

              <button
                type="button"
                onClick={resetState}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-transparent py-3 font-semibold text-violet-300 transition hover:bg-violet-500/5 hover:border-violet-500"
              >
                <RefreshCw className="h-4 w-4" />
                Convert Another Format
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
