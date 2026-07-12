"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCw, CheckCircle, RefreshCcw } from "lucide-react";

interface PdfJsPage {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> };
}

interface PdfJsDoc {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
}

interface RotatePreviewProps {
  file: File;
  selectedPages: number[];
  pageRotations: Record<number, number>;
  onTogglePage: (pageIdx: number) => void;
  onRotatePage: (pageIdx: number, direction: "cw" | "ccw") => void;
  onLoad?: (pageCount: number) => void;
}

export default function RotatePreview({
  file,
  selectedPages,
  pageRotations,
  onTogglePage,
  onRotatePage,
  onLoad,
}: RotatePreviewProps) {
  const [pdfDoc, setPdfDoc] = useState<unknown>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPdf() {
      setLoading(true);
      setError("");
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(await file.arrayBuffer()),
        });

        const pdf = await loadingTask.promise;
        if (active) {
          setPdfDoc(pdf);
          setPageCount(pdf.numPages);
          onLoad?.(pdf.numPages);
        }
      } catch (err) {
        console.error("Error loading PDF for preview:", err);
        if (active) {
          setError("Failed to load PDF preview.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPdf();

    return () => {
      active = false;
    };
  }, [file, onLoad]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
        <p className="mt-4 text-gray-400 text-sm">Generating document previews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-sm text-rose-400">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: pageCount }).map((_, idx) => {
          const isSelected = selectedPages.includes(idx);
          const rotation = pageRotations[idx] ?? 0;

          return (
            <ThumbnailCard
              key={idx}
              pdfDoc={pdfDoc}
              pageIdx={idx}
              isSelected={isSelected}
              rotation={rotation}
              onToggle={() => onTogglePage(idx)}
              onRotate={(dir) => onRotatePage(idx, dir)}
            />
          );
        })}
      </div>
    </div>
  );
}

interface ThumbnailCardProps {
  pdfDoc: unknown;
  pageIdx: number;
  isSelected: boolean;
  rotation: number;
  onToggle: () => void;
  onRotate: (dir: "cw" | "ccw") => void;
}

function ThumbnailCard({
  pdfDoc,
  pageIdx,
  isSelected,
  rotation,
  onToggle,
  onRotate,
}: ThumbnailCardProps) {
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
        const doc = pdfDoc as PdfJsDoc;
        const page = await doc.getPage(pageIdx + 1);
        if (!active) return;

        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        if (active) {
          setRendered(true);
        }
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
    <div
      ref={containerRef}
      className={`group relative flex flex-col rounded-2xl border bg-black/30 p-3 transition-all duration-300 ${
        isSelected
          ? "border-blue-500 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
          : "border-gray-800 hover:border-gray-700"
      }`}
    >
      {/* Checkbox Overlay */}
      <button
        type="button"
        onClick={onToggle}
        className={`absolute top-5 left-5 z-20 flex h-6 w-6 items-center justify-center rounded-lg border transition ${
          isSelected
            ? "border-blue-500 bg-blue-500 text-white"
            : "border-gray-600 bg-black/60 text-transparent hover:border-blue-400"
        }`}
      >
        <CheckCircle className="h-4 w-4" />
      </button>

      {/* Render Canvas Container */}
      <div
        onClick={onToggle}
        className="relative flex aspect-[3/4] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-black/40"
      >
        {!rendered && (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white/40" />
        )}
        <div
          className="relative max-h-full max-w-full overflow-hidden flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <canvas ref={canvasRef} className="max-h-full max-w-full object-contain" />
        </div>
      </div>

      {/* Page Info & Rotations Footer */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400">Page {pageIdx + 1}</span>
        
        {/* Rotation tools */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            title="Rotate Left"
            onClick={(e) => {
              e.stopPropagation();
              onRotate("ccw");
            }}
            className="rounded-lg p-1.5 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            <RefreshCcw className="h-3 w-3" />
          </button>
          <button
            type="button"
            title="Rotate Right"
            onClick={(e) => {
              e.stopPropagation();
              onRotate("cw");
            }}
            className="rounded-lg p-1.5 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            <RotateCw className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
