"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Initialize pdfjs worker
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

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

export interface PdfToImagesPreviewProps {
  file: File;
  onLoad: (pageCount: number) => void;
}

export default function PdfToImagesPreview({ file, onLoad }: PdfToImagesPreviewProps) {
  const [pdfDoc, setPdfDoc] = useState<PdfJsDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let active = true;

    async function loadPdf() {
      try {
        setLoading(true);
        setError("");
        const buffer = await file.arrayBuffer();
        const doc = await pdfjsLib.getDocument(buffer).promise;
        if (!active) return;
        setPdfDoc(doc as unknown as PdfJsDoc);
        onLoad(doc.numPages);
      } catch (err) {
        if (active) {
          console.error("Failed to load PDF for preview:", err);
          setError("Failed to load PDF preview.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPdf();

    return () => {
      active = false;
    };
  }, [file, onLoad]);

  useEffect(() => {
    if (!pdfDoc) return;

    let active = true;

    async function renderFirstPage() {
      try {
        if (!pdfDoc) return;
        const page = await pdfDoc.getPage(1);
        if (!active) return;

        const viewport = page.getViewport({ scale: 0.5 }); // High enough for preview
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
      } catch (err) {
        console.error("Error rendering first page:", err);
      }
    }

    renderFirstPage();

    return () => {
      active = false;
    };
  }, [pdfDoc]);

  return (
    <div className="mt-8 flex flex-col items-center">
      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-black/40 p-2 shadow-2xl transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]">
        {loading ? (
          <div className="flex h-64 w-48 items-center justify-center bg-gray-900/50">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500" />
          </div>
        ) : error ? (
          <div className="flex h-64 w-48 items-center justify-center bg-gray-900/50 text-center text-sm text-rose-400">
            {error}
          </div>
        ) : (
          <div className="flex aspect-[3/4] h-64 items-center justify-center overflow-hidden rounded-xl bg-white shadow-inner">
            <canvas ref={canvasRef} className="max-h-full max-w-full object-contain" />
          </div>
        )}
      </div>
      {pdfDoc && !loading && (
        <p className="mt-4 text-sm font-medium text-gray-400">
          Ready to extract <span className="font-bold text-white">{pdfDoc.numPages}</span> page{pdfDoc.numPages !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
