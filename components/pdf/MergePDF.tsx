"use client";

import { ChangeEvent, DragEvent, useCallback, useState } from "react";
import { FilePlus2 } from "lucide-react";
import { mergePdfFiles, prepareMergeItems } from "@/services/pdf/mergeService";
import type { MergePdfItem } from "@/types/pdf";

import Button from "@/components/ui/Button";

import MergeControls from "./MergeControls";
import MergeList from "./MergeList";

export default function MergePDF() {
  const [items, setItems] = useState<MergePdfItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFiles = useCallback(async (incomingFiles: FileList | File[] | null | undefined) => {
    if (!incomingFiles || incomingFiles.length === 0) {
      return;
    }

    const files = Array.from(incomingFiles);
    const prepared = await prepareMergeItems(files);
    const nextItems = [...items, ...prepared];
    setItems(nextItems);
    setError("");
    setSuccess(
      prepared.filter((item) => item.status === "ready").length > 0
        ? "PDFs added. Review the list and merge when ready."
        : "No valid PDFs were added."
    );
  }, [items]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void handleFiles(event.dataTransfer.files);
  }, [handleFiles]);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    void handleFiles(event.target.files);
    event.target.value = "";
  }, [handleFiles]);

  const handleRemove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const handleMove = useCallback((fromIndex: number, toIndex: number) => {
    setItems((current) => {
      const next = [...current];
      const [movingItem] = next.splice(fromIndex, 1);
      if (!movingItem) {
        return current;
      }
      next.splice(toIndex, 0, movingItem);
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    setItems([]);
    setError("");
    setSuccess("");
  }, []);

  const handleMerge = useCallback(async () => {
    if (items.length < 2) {
      setError("Select at least two valid PDFs to merge.");
      return;
    }

    setIsMerging(true);
    setError("");
    setSuccess("");

    const result = await mergePdfFiles(items);

    if (!result.success || !result.blob) {
      setError(result.error ?? "The merge could not be completed.");
      setIsMerging(false);
      return;
    }

    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.fileName ?? "merged-pdfs.pdf";
    link.click();
    URL.revokeObjectURL(url);

    setSuccess("Merged PDF downloaded successfully.");
    setIsMerging(false);
    setItems([]);
  }, [items]);

  return (
    <div className="relative">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group mx-auto max-w-4xl rounded-[32px] border border-dashed p-6 text-center backdrop-blur-xl transition-all duration-300 md:p-12 ${
          isDragging
            ? "scale-[1.02] border-cyan-300 bg-blue-500/10 shadow-[0_24px_80px_rgba(34,211,238,0.20)]"
            : "border-blue-400/40 bg-white/5 hover:-translate-y-1 hover:border-blue-300/70 hover:bg-white/[0.07] hover:shadow-[0_20px_70px_rgba(37,99,235,0.20)]"
        }`}
      >
        <input
          type="file"
          accept="application/pdf,.pdf"
          multiple
          onChange={handleFileChange}
          className="sr-only"
        />

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-600/20 transition-all duration-300 md:h-28 md:w-28">
          <FilePlus2 className="h-12 w-12 text-blue-400 md:h-14 md:w-14" />
        </div>

        <h2 className="mt-8 text-3xl font-extrabold text-white md:text-5xl">Merge PDFs</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-400">
          Select multiple PDFs, reorder them, and download one merged file.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
              <FilePlus2 className="h-5 w-5" />
              Choose PDFs
            </span>
            <input type="file" accept="application/pdf,.pdf" multiple onChange={handleFileChange} className="sr-only" />
          </label>
          <p className="text-sm text-gray-500">Drag and drop multiple PDF files</p>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm font-medium text-rose-200">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm font-medium text-emerald-200">
            {success}
          </div>
        ) : null}

        <MergeList items={items} onRemove={handleRemove} onMove={handleMove} />
        <MergeControls selectedCount={items.length} isMerging={isMerging} onMerge={handleMerge} onClear={handleClear} />
      </div>
    </div>
  );
}
