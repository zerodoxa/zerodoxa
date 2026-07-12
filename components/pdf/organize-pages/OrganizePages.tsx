"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Trash2, FileText, AlertCircle, CheckCircle } from "lucide-react";
import PDFUpload from "@/components/pdf/PDFUpload";
import OrganizePreview from "./OrganizePreview";
import OrganizeControls from "./OrganizeControls";
import type { PageItem } from "./OrganizePreview";

// ── PDF.js type shims (used only for loading, not for rendering) ──────────────

interface PdfJsDoc {
  numPages: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OrganizePages() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<unknown>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [removedPages, setRemovedPages] = useState<PageItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [downloadName, setDownloadName] = useState("");

  // ── Reset state when the file is cleared ────────────────────────────────────

  useEffect(() => {
    if (file) return;
    // file was removed — clear all derived state
    const timer = setTimeout(() => {
      setPdfDoc(null);
      setPages([]);
      setRemovedPages([]);
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
          Array.from({ length: (pdf as PdfJsDoc).numPages }).map((_, i) => ({
            id: `page-${i}-${crypto.randomUUID().slice(0, 8)}`,
            originalIndex: i,
            rotation: 0,
          }))
        );
        setRemovedPages([]);
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
    setRemovedPages([]);
    setDownloadBlob(null);
    setDownloadName("");
  };

  const handleResetAll = () => {
    resetResult();
    if (file) {
      // Force the useEffect to re-run by toggling the file value.
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

  const handleRotatePage = useCallback((id: string) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
  }, []);

  const handleDeletePage = useCallback((id: string) => {
    setPages((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) {
        setRemovedPages((r) => [...r, item]);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const handleRestorePage = useCallback((id: string) => {
    setRemovedPages((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) {
        setPages((pp) => [...pp, item]);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleOrganizeSubmit = async () => {
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
        JSON.stringify(
          pages.map((p) => ({ originalIndex: p.originalIndex, rotation: p.rotation }))
        )
      );

      const res = await fetch("/api/pdf/organize", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
          (errBody as { error?: string }).error || "Failed to organize PDF"
        );
      }

      const blob = await res.blob();
      const suggestedName = `${file.name.replace(/\.pdf$/i, "")}-organized.pdf`;

      // Trigger immediate download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = suggestedName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadBlob(blob);
      setDownloadName(suggestedName);
      setSuccess("PDF successfully organized and download started!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-4xl font-bold tracking-tight text-white text-center">
          Organize PDF Pages
        </h2>
        <p className="mt-4 text-gray-400 text-center max-w-2xl mx-auto">
          Reorder, rotate, and delete pages visually — then generate a brand-new
          PDF in one click.
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-violet-500/20 bg-slate-950/70 p-6 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/20">
                    <FileText className="h-6 w-6 text-violet-400" />
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
                <div
                  role="alert"
                  className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-300 flex items-center gap-3"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm font-medium text-emerald-200 flex items-center gap-3"
                >
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Loading spinner while initial PDF parse runs */}
              {loading && pages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500" />
                  <p className="mt-4 text-gray-400 text-sm">
                    Parsing pages for visual organization…
                  </p>
                </div>
              ) : (
                <>
                  {/* Drag-and-drop thumbnail grid */}
                  <OrganizePreview
                    pdfDoc={pdfDoc}
                    pages={pages}
                    removedPages={removedPages}
                    onMovePage={handleMovePage}
                    onRotatePage={handleRotatePage}
                    onDeletePage={handleDeletePage}
                    onRestorePage={handleRestorePage}
                  />

                  {/* Action bar */}
                  <OrganizeControls
                    pageCount={pages.length}
                    isLoading={loading}
                    downloadBlob={downloadBlob}
                    downloadName={downloadName}
                    onSubmit={handleOrganizeSubmit}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
