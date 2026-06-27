"use client";

import { ChangeEvent, DragEvent, ReactNode, useId, useRef } from "react";
import { FileUp, UploadCloud } from "lucide-react";

import Button from "@/components/ui/Button";
import { PDF_ACCEPT } from "@/lib/pdf/constants";

interface DropZoneProps {
  isDragging: boolean;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onFileSelect: (file: File | null | undefined) => void;
  disabled?: boolean;
  children?: ReactNode;
  overlay?: ReactNode;
}

export default function DropZone({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  disabled = false,
  children,
  overlay,
}: DropZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFileSelect(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
    <div
      role="presentation"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`group mx-auto max-w-4xl rounded-[32px] border border-dashed p-6 text-center backdrop-blur-xl transition-all duration-300 md:p-12 ${
        isDragging
          ? "scale-[1.02] border-cyan-300 bg-blue-500/10 shadow-[0_24px_80px_rgba(34,211,238,0.20)]"
          : "border-blue-400/40 bg-white/5 hover:-translate-y-1 hover:border-blue-300/70 hover:bg-white/[0.07] hover:shadow-[0_20px_70px_rgba(37,99,235,0.20)]"
      } ${disabled ? "pointer-events-none opacity-70" : ""}`}
    >
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={PDF_ACCEPT}
        onChange={handleFileChange}
        className="sr-only"
        disabled={disabled}
      />

      <div
        className={`mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-600/20 transition-all duration-300 md:h-28 md:w-28 ${
          isDragging ? "rotate-3 scale-110 bg-cyan-500/20" : "group-hover:scale-105"
        }`}
      >
        <UploadCloud className="h-12 w-12 text-blue-400 md:h-14 md:w-14" />
      </div>

      <h2 className="mt-8 text-3xl font-extrabold text-white md:text-5xl">
        Drop your PDF here
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-400">
        Drag and drop a PDF, or choose one from your device. Processing PDFMedic will simulate repair locally for now. No backend upload or API call is connected yet.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button
          type="button"
          variant="primary"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <span className="inline-flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Choose PDF
          </span>
        </Button>

        <p className="text-sm text-gray-500">PDF files up to 100 MB</p>
      </div>

      {children ? <div className="mx-auto mt-8 max-w-2xl">{children}</div> : null}
      {overlay ? <div className="pointer-events-none absolute inset-0">{overlay}</div> : null}
    </div>
  );
}
