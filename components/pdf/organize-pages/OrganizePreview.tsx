"use client";

import { DragEvent, useEffect, useRef, useState } from "react";
import {
  GripHorizontal,
  Trash2,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Plus,
} from "lucide-react";

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

// ── Public types ──────────────────────────────────────────────────────────────

export interface PageItem {
  /** Stable unique id for React keys and drag tracking. */
  id: string;
  /** 0-indexed original page index in the source PDF. */
  originalIndex: number;
  /** Visual rotation (0 | 90 | 180 | 270). */
  rotation: number;
}

export interface OrganizePreviewProps {
  pdfDoc: unknown;
  pages: PageItem[];
  removedPages: PageItem[];
  onMovePage: (fromIndex: number, toIndex: number) => void;
  onRotatePage: (id: string) => void;
  onDeletePage: (id: string) => void;
  onRestorePage: (id: string) => void;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OrganizePreview({
  pdfDoc,
  pages,
  removedPages,
  onMovePage,
  onRotatePage,
  onDeletePage,
  onRestorePage,
}: OrganizePreviewProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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
      onMovePage(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-8">
      {/* Counter label */}
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        {pages.length} page{pages.length !== 1 ? "s" : ""} — drag cards to
        reorder
      </p>

      {/* Thumbnail grid */}
      <div
        data-testid="organize-grid"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      >
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
              data-testid={`page-card-${item.id}`}
              className={[
                "group relative flex flex-col rounded-2xl border bg-black/40 p-3 transition-all duration-200 select-none",
                isDragOver
                  ? "border-violet-500 bg-violet-500/10 scale-105 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                  : isDragging
                  ? "border-violet-500/40 opacity-50"
                  : "border-gray-800/80 hover:border-violet-500/30 hover:bg-slate-950/70",
              ].join(" ")}
            >
              {/* Drag handle */}
              <div
                aria-hidden="true"
                className="absolute top-3 left-3 z-10 flex h-7 w-7 cursor-grab items-center justify-center rounded-lg bg-black/60 border border-white/10 text-gray-400 hover:text-white transition active:cursor-grabbing"
              >
                <GripHorizontal className="h-4 w-4" />
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => onDeletePage(item.id)}
                aria-label={`Remove page ${item.originalIndex + 1}`}
                className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 border border-white/10 text-gray-400 hover:border-rose-500/30 hover:bg-rose-500/20 hover:text-rose-300 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              {/* Canvas preview */}
              <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-black/40 mt-1">
                <div
                  className="relative max-h-full max-w-full overflow-hidden flex items-center justify-center transition-transform duration-300 ease-out"
                  style={{ transform: `rotate(${item.rotation}deg)` }}
                >
                  <ThumbnailCanvas
                    pdfDoc={pdfDoc}
                    pageIdx={item.originalIndex}
                  />
                </div>
              </div>

              {/* Footer: position label + controls */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-xs font-semibold text-gray-400">
                    Position {index + 1}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    Orig. p.{item.originalIndex + 1}
                  </span>
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => onMovePage(index, index - 1)}
                    aria-label={`Move page ${item.originalIndex + 1} left`}
                    className="rounded-lg p-1 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRotatePage(item.id)}
                    aria-label={`Rotate page ${item.originalIndex + 1} 90° clockwise`}
                    className="rounded-lg p-1 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={index === pages.length - 1}
                    onClick={() => onMovePage(index, index + 1)}
                    aria-label={`Move page ${item.originalIndex + 1} right`}
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

      {/* Removed pages restore shelf */}
      {removedPages.length > 0 && (
        <div className="rounded-3xl border border-gray-800 bg-black/20 p-6 text-left">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Removed Pages ({removedPages.length})
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            Click a card to restore it back to the PDF.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {removedPages.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onRestorePage(item.id)}
                aria-label={`Restore page ${item.originalIndex + 1}`}
                className="group flex items-center gap-2 rounded-2xl border border-gray-800 bg-black/40 hover:border-violet-500/40 hover:bg-violet-500/5 px-4 py-3 transition"
              >
                <span className="text-xs font-semibold text-gray-400">
                  Page {item.originalIndex + 1}
                </span>
                <div className="rounded-lg bg-white/5 p-1 text-gray-500 group-hover:text-violet-400 transition">
                  <Plus className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Lazy thumbnail canvas ─────────────────────────────────────────────────────

interface ThumbnailCanvasProps {
  pdfDoc: unknown;
  pageIdx: number;
}

function ThumbnailCanvas({ pdfDoc, pageIdx }: ThumbnailCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Only start rendering when the card scrolls into the viewport.
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
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center"
    >
      {!rendered && (
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white/40" />
      )}
      <canvas
        ref={canvasRef}
        aria-label={`Page ${pageIdx + 1} thumbnail`}
        className={`max-h-full max-w-full object-contain ${
          rendered ? "block" : "hidden"
        }`}
      />
    </div>
  );
}
