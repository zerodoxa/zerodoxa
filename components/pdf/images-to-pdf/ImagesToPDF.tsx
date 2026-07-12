"use client";

import { useState, useCallback, useRef, DragEvent, ChangeEvent } from "react";
import { ImageIcon, Download, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import ImageList from "./ImageList";
import ImagesToPdfControls from "./ImagesToPdfControls";
import type { ImageItem, PageSize, Orientation, MarginSize } from "@/types/pdf";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_EXT = ".jpg,.jpeg,.png,.webp";

function makeImageItem(file: File): ImageItem {
  return {
    id: `${file.name}-${Date.now()}-${Math.random()}`,
    file,
    name: file.name,
    size: file.size,
    previewUrl: URL.createObjectURL(file),
    status: ACCEPTED_TYPES.includes(file.type) ? "ready" : "error",
    error: ACCEPTED_TYPES.includes(file.type) ? undefined : "Unsupported type",
  };
}

export default function ImagesToPDF() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);

  // Settings
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState<MarginSize>("medium");

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter((f) => ACCEPTED_TYPES.includes(f.type));
    const invalid = incoming.length - valid.length;
    if (invalid > 0) {
      setError(`${invalid} file(s) skipped — only JPG, PNG, and WebP are supported.`);
    } else {
      setError("");
    }
    setItems((prev) => [...prev, ...valid.map(makeImageItem)]);
    setSuccess("");
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = "";
  }, [addFiles]);

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const handleMove = useCallback((fromIndex: number, toIndex: number) => {
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      if (!moved) return prev;
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setItems([]);
    setError("");
    setSuccess("");
    setDownloadUrl(null);
    setDownloadName(null);
    setPageCount(null);
    setDownloadBlob(null);
  }, [items, downloadUrl]);

  const handleConvert = useCallback(async () => {
    const ready = items.filter((i) => i.status === "ready");
    if (ready.length === 0) {
      setError("Add at least one image before converting.");
      return;
    }

    setIsConverting(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      ready.forEach((item) => formData.append("images", item.file));
      formData.append("pageSize", pageSize);
      formData.append("orientation", orientation);
      formData.append("margin", margin);

      const res = await fetch("/api/pdf/images-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Conversion failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images-to-pdf.pdf";
      a.click();
      URL.revokeObjectURL(url);

      const pages = ready.length;
      setDownloadBlob(blob);
      setDownloadUrl(url);
      setDownloadName("images-to-pdf.pdf");
      setPageCount(pages);
      setSuccess(`PDF created with ${pages} page${pages !== 1 ? "s" : ""}!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsConverting(false);
    }
  }, [items, pageSize, orientation, margin]);

  const readyCount = items.filter((i) => i.status === "ready").length;

  return (
    <div className="relative">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group mx-auto max-w-5xl rounded-4xl border border-dashed p-6 text-center backdrop-blur-xl transition-all duration-300 md:p-12 ${
          isDragging
            ? "scale-[1.01] border-pink-400 bg-pink-500/10 shadow-[0_24px_80px_rgba(236,72,153,0.2)]"
            : "border-pink-400/30 bg-white/5 hover:border-pink-400/60 hover:bg-white/[0.07]"
        }`}
      >
        {/* Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-600/30 to-rose-600/20 transition-all duration-300 md:h-28 md:w-28 group-hover:scale-105">
          <ImageIcon className="h-12 w-12 text-pink-400 md:h-14 md:w-14" />
        </div>

        <h2 className="mt-8 text-3xl font-extrabold text-white md:text-5xl">Images to PDF</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-400">
          Convert JPG, PNG, and WebP images into a polished PDF. Reorder by drag and drop.
        </p>

        {/* Upload button */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 hover:shadow-[0_8px_30px_rgba(236,72,153,0.3)]"
          >
            <span className="inline-flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Choose Images
            </span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXT}
            multiple
            onChange={handleFileChange}
            className="sr-only"
          />
          <p className="text-sm text-gray-500">or drag &amp; drop JPG, PNG, WebP files here</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm font-medium text-rose-200">
            {error}
          </div>
        )}

        {/* Image list */}
        {items.length > 0 && !downloadUrl && (
          <>
            <ImageList items={items} onRemove={handleRemove} onMove={handleMove} />

            {/* PDF settings + Convert */}
            {!isConverting && (
              <ImagesToPdfControls
                pageSize={pageSize}
                orientation={orientation}
                margin={margin}
                imageCount={readyCount}
                isConverting={isConverting}
                onPageSizeChange={setPageSize}
                onOrientationChange={setOrientation}
                onMarginChange={setMargin}
                onConvert={handleConvert}
              />
            )}
          </>
        )}

        {/* Loading */}
        {isConverting && (
          <div className="mt-10 flex flex-col items-center justify-center py-16">
            <div className="relative flex items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-pink-500/20 border-t-pink-500" />
              <ImageIcon className="absolute h-6 w-6 animate-pulse text-pink-400" />
            </div>
            <p className="mt-6 text-lg font-semibold text-white animate-pulse">Converting images...</p>
            <p className="mt-2 text-sm text-gray-400">Embedding {readyCount} image{readyCount !== 1 ? "s" : ""} into your PDF</p>
          </div>
        )}

        {/* Success / Download */}
        {downloadUrl && downloadName && !isConverting && (
          <div className="mt-10 mx-auto max-w-md rounded-3xl border border-pink-500/20 bg-pink-950/10 p-8 text-left shadow-lg backdrop-blur-md">
            <h3 className="text-xl font-bold text-white">
              PDF Ready — {pageCount} page{pageCount !== 1 ? "s" : ""}
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              Your PDF has been created. If the download didn&apos;t start automatically, use the button below.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  if (downloadBlob) {
                    const url = URL.createObjectURL(downloadBlob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "images-to-pdf.pdf";
                    link.click();
                    URL.revokeObjectURL(url);
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 py-3 font-semibold text-white transition hover:from-pink-500 hover:to-rose-500"
              >
                <Download className="h-5 w-5" />
                Download PDF
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-500/30 py-3 font-semibold text-pink-300 transition hover:bg-pink-500/5 hover:border-pink-500"
              >
                <RefreshCw className="h-4 w-4" />
                Convert More Images
              </button>
            </div>
          </div>
        )}

        {/* Success text (non-download) */}
        {success && !downloadUrl && (
          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm font-medium text-emerald-200">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
