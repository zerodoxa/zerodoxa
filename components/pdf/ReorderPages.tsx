"use client";

import { useState, useEffect, useCallback, DragEvent, useRef } from "react";
import { RefreshCw, Trash2, FileText, AlertCircle, CheckCircle, GripHorizontal, ArrowLeft, ArrowRight, Loader2, Download } from "lucide-react";
import PDFUpload from "@/components/pdf/PDFUpload";

// ── PDF.js type shims ─────────────────────────────────────────────────────────

interface PdfJsViewport {
  width: number;
  height: number;
}

interface PdfJsPage {
  getViewport: (options: { scale: number }) => PdfJsViewport;
  render: (options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfJsViewport;
  }) => { promise: Promise<void> };
}

interface PdfJsDoc {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
}

export interface PageItem {
  id: string;
  originalIndex: number;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReorderPages() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<unknown>(null);
  const [pages, setPages] = useState<PageItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [downloadName, setDownloadName] = useState("");

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ── Reset state when the file is cleared ────────────────────────────────────

  useEffect(() => {
    if (file) return;
    const timer = setTimeout(() => {
      setPdfDoc(null);
      setPages([]);
    }, 0);
    return () => clearTimeout(timer);
  }, [file]);

  // ── Load PDF with pdf.js when a file is selected ────────────────────────────

  useEffect(() => {
    if (!file) return;
    const currentFile = file;
    let active = true;

    async function loadPdf() {
      setLoading(true);
      setError("");
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdf = await pdfjs
          .getDocument({ data: new Uint8Array(await currentFile.arrayBuffer()) })
          .promise;

        if (!active) return;

        setPdfDoc(pdf);
        setPages(
          Array.from({ length: (pdf as unknown as PdfJsDoc).numPages }).map((_, i) => ({
            id: `page-${i}-${crypto.randomUUID().slice(0, 8)}`,
            originalIndex: i,
          }))
        );
      } catch (err) {
        console.error("Error loading PDF for preview:", err);
        if (active) setError("Failed to load PDF preview.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPdf();
    return () => {
      active = false;
    };
  }, [file]);

  // ── File handlers ───────────────────────────────────────────────────────────

  const handleFileSelected = (selectedFile: File) => {
    resetResult();
    setError("");
    setSuccess("");
    setFile(selectedFile);
  };

  const handleFileRemoved = () => {
    setFile(null);
    resetResult();
    setError("");
    setSuccess("");
  };

  const resetResult = () => {
    setPages([]);
    setDownloadBlob(null);
    setDownloadName("");
  };

  const handleResetAll = () => {
    resetResult();
    if (file) {
      const current = file;
      setFile(null);
      setTimeout(() => setFile(current), 50);
    }
  };

  // ── Page operations ─────────────────────────────────────────────────────────

  const handleMovePage = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || toIndex < 0) return;
    setPages((prev) => {
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const handleDragStart = (e: DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      handleMovePage(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleReorderSubmit = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }
    if (pages.length === 0) {
      setError("At least one page is required to generate a PDF.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "pages",
        JSON.stringify(pages.map((p) => p.originalIndex))
      );

      const res = await fetch("/api/pdf/reorder", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
          (errBody as { error?: string }).error || "Failed to reorder PDF"
        );
      }

      const blob = await res.blob();
      const suggestedName = `${file.name.replace(/\.pdf$/i, "")}-reordered.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = suggestedName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadBlob(blob);
      setDownloadName(suggestedName);
      setSuccess("PDF successfully reordered and download started!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAgain = () => {
    if (!downloadBlob || !downloadName) return;
    const url = URL.createObjectURL(downloadBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-4xl font-bold tracking-tight text-white text-center">
          Reorder PDF Pages
        </h2>
        <p className="mt-4 text-gray-400 text-center max-w-2xl mx-auto">
          Drag and drop to quickly arrange PDF pages in the perfect order.
        </p>

        <div className="mt-10">
          {!file ? (
            <PDFUpload
              onFileSelected={handleFileSelected}
              onFileRemoved={handleFileRemoved}
            />
          ) : (
            <div className="space-y-8">
              {/* File info header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-fuchsia-500/20 bg-slate-950/70 p-6 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-600/20">
                    <FileText className="h-6 w-6 text-fuchsia-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-white truncate max-w-[250px] sm:max-w-md">
                      {file.name}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetAll}
                    aria-label="Reset page arrangement to original"
                    className="flex items-center gap-2 rounded-xl border border-gray-700 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleFileRemoved}
                    aria-label="Remove the current file"
                    className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove File
                  </button>
                </div>
              </div>

              {/* Alerts */}
              {error && (
                <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-300 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div role="status" className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm font-medium text-emerald-200 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Loading spinner while initial PDF parse runs */}
              {loading && pages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-fuchsia-500/20 border-t-fuchsia-500" />
                  <p className="mt-4 text-gray-400 text-sm">
                    Parsing pages for visual organization…
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-8">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      {pages.length} page{pages.length !== 1 ? "s" : ""} — drag cards to reorder
                    </p>

                    {/* Thumbnail grid */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {pages.map((item, index) => {
                        const isDragOver = index === dragOverIndex;
                        const isDragging = index === draggedIndex;

                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className={[
                              "group relative flex flex-col rounded-2xl border bg-black/40 p-3 transition-all duration-200 select-none",
                              isDragOver
                                ? "border-fuchsia-500 bg-fuchsia-500/10 scale-105 shadow-[0_0_20px_rgba(217,70,239,0.3)]"
                                : isDragging
                                ? "border-fuchsia-500/40 opacity-50"
                                : "border-gray-800/80 hover:border-fuchsia-500/30 hover:bg-slate-950/70",
                            ].join(" ")}
                          >
                            <div aria-hidden="true" className="absolute top-3 left-3 z-10 flex h-7 w-7 cursor-grab items-center justify-center rounded-lg bg-black/60 border border-white/10 text-gray-400 hover:text-white transition active:cursor-grabbing">
                              <GripHorizontal className="h-4 w-4" />
                            </div>

                            <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-black/40 mt-1">
                              <div className="relative max-h-full max-w-full overflow-hidden flex items-center justify-center transition-transform duration-300 ease-out">
                                <ThumbnailCanvas pdfDoc={pdfDoc} pageIdx={item.originalIndex} />
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex flex-col text-left leading-tight">
                                <span className="text-xs font-semibold text-gray-400">Position {index + 1}</span>
                                <span className="text-[10px] text-gray-600">Orig. p.{item.originalIndex + 1}</span>
                              </div>

                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMovePage(index, index - 1)}
                                  className="rounded-lg p-1 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
                                >
                                  <ArrowLeft className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === pages.length - 1}
                                  onClick={() => handleMovePage(index, index + 1)}
                                  className="rounded-lg p-1 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
                                >
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-gray-800 bg-black/40 p-6 backdrop-blur-md">
                    <div className="text-sm text-gray-400">
                      Arranged <span className="font-bold text-white">{pages.length}</span> pages.
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      {downloadBlob ? (
                        <button
                          type="button"
                          onClick={handleDownloadAgain}
                          className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-8 py-3 font-semibold text-emerald-400 transition hover:bg-emerald-500/20 hover:text-emerald-300"
                        >
                          <Download className="h-5 w-5" />
                          Download Again
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleReorderSubmit}
                          disabled={loading || pages.length === 0}
                          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-8 py-3 font-semibold text-white transition hover:from-fuchsia-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <ArrowRight className="h-5 w-5" />
                              Create Reordered PDF
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Lazy thumbnail canvas ─────────────────────────────────────────────────────

function ThumbnailCanvas({ pdfDoc, pageIdx }: { pdfDoc: unknown; pageIdx: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !pdfDoc || rendered) return;

    let active = true;

    async function renderPage() {
      try {
        const doc = pdfDoc as unknown as PdfJsDoc;
        const page = await doc.getPage(pageIdx + 1);
        if (!active) return;

        const viewport = page.getViewport({ scale: 0.35 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        if (active) setRendered(true);
      } catch (err) {
        console.error(`Error rendering page ${pageIdx + 1}:`, err);
      }
    }

    void renderPage();
    return () => {
      active = false;
    };
  }, [isVisible, pdfDoc, pageIdx, rendered]);

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center">
      {!rendered && (
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white/40" />
      )}
      <canvas
        ref={canvasRef}
        aria-label={`Page ${pageIdx + 1} thumbnail`}
        className={`max-h-full max-w-full object-contain ${rendered ? "block" : "hidden"}`}
      />
    </div>
  );
}
