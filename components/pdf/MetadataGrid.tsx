"use client";

import type { PDFDocumentMetadata } from "@/types/pdf";

interface MetadataGridProps {
  metadata: PDFDocumentMetadata;
}

const metadataFields: Array<{ label: string; value?: string | number }> = [];

export default function MetadataGrid({ metadata }: MetadataGridProps) {
  const fields = [
    { label: "File name", value: metadata.fileName },
    { label: "File size", value: `${(metadata.fileSize / 1024 / 1024).toFixed(2)} MB` },
    { label: "Pages", value: metadata.pageCount },
    { label: "PDF version", value: metadata.pdfVersion },
    { label: "Author", value: metadata.author },
    { label: "Title", value: metadata.title },
    { label: "Subject", value: metadata.subject },
    { label: "Creator", value: metadata.creator },
    { label: "Created", value: metadata.creationDate },
    { label: "Modified", value: metadata.modificationDate },
  ];

  return (
    <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left text-sm text-gray-300 sm:grid-cols-2">
      {fields.map((field) => {
        const value = field.value ?? "—";
        return (
          <div key={field.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">{field.label}</p>
            <p className="mt-1 font-medium text-white">{value}</p>
          </div>
        );
      })}
    </div>
  );
}
