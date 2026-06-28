"use client";

import {
  useState,
  useCallback,
  ChangeEvent,
  DragEvent,
} from "react";

import {
  FilePlus2,
  Scissors,
} from "lucide-react";

import {
  prepareSplitItems,
  splitPdf,
} from "@/services/pdf/splitPdfService";

import type {
  SplitPdfItem,
  SplitPdfOptions,
} from "@/types/pdf";

export default function SplitPDF() {
  const [items, setItems] = useState<SplitPdfItem[]>([]);

  const [mode, setMode] =
    useState<"all" | "range">("all");

  const [range, setRange] = useState("");

  const [isDragging, setDragging] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const handleFiles = useCallback(
    async (
      incoming: FileList | File[] | null | undefined
    ) => {
      if (!incoming) return;

      const prepared = await prepareSplitItems(
        Array.from(incoming)
      );

      setItems(prepared);

      setError("");
      setSuccess("");
    },
    []
  );

  const dragOver = (
    e: DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    setDragging(true);
  };

  const dragLeave = (
    e: DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    setDragging(false);
  };

  const drop = (
    e: DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();

    setDragging(false);

    handleFiles(e.dataTransfer.files);
  };

  const chooseFiles = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    handleFiles(e.target.files);

    e.target.value = "";
  };

  const handleSplit = async () => {
    const selectedItem = items[0];

    if (!selectedItem) {
      setError("Choose a PDF first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const options: SplitPdfOptions = {
      mode,
      range,
    };

    const result = await splitPdf(
      selectedItem,
      options
    );

    if (!result.success) {
      setError(result.error ?? "Split failed.");
      setLoading(false);
      return;
    }

    const files = result.files ?? [];
    const fileNames = result.fileNames ?? [];

    files.forEach((blob, index) => {
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download =
        fileNames[index] ??
        `page-${index + 1}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    });

    setSuccess(
      `${files.length} PDF(s) generated successfully.`
    );

    setLoading(false);
  };

  const selectedItem = items[0];

  return (
    <div className="relative">
      <div
        onDragOver={dragOver}
        onDragLeave={dragLeave}
        onDrop={drop}
        className={`mx-auto max-w-4xl rounded-4xl border border-dashed p-8 text-center transition-all duration-300 ${
          isDragging
            ? "border-cyan-400 bg-blue-500/10"
            : "border-blue-400/40 bg-white/5"
        }`}
      >
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-600/20">
          <Scissors className="h-12 w-12 text-blue-400" />
        </div>

        <h2 className="mt-8 text-4xl font-bold text-white">
          Split PDF
        </h2>

        <p className="mt-4 text-gray-400">
          Split every page or extract custom page ranges.
        </p>

        <label className="mt-10 flex cursor-pointer justify-center">
          <span className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
            <FilePlus2 className="h-5 w-5" />
            Choose PDF
          </span>

          <input
            type="file"
            accept=".pdf"
            onChange={chooseFiles}
            className="hidden"
          />
        </label>

        {selectedItem && (
          <div className="mt-8 rounded-xl border border-blue-500/20 bg-black/20 p-5 text-left">
            <p className="text-lg font-semibold text-white">
              {selectedItem.name}
            </p>

            <p className="mt-2 text-gray-400">
              {(selectedItem.size / 1024 / 1024).toFixed(2)} MB
            </p>

            <p className="text-gray-400">
              {selectedItem.pages} Pages
            </p>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-gray-700 p-6">
          <div className="flex gap-8">
            <label className="flex items-center gap-2 text-white">
              <input
                type="radio"
                checked={mode === "all"}
                onChange={() => setMode("all")}
              />
              Split Every Page
            </label>

            <label className="flex items-center gap-2 text-white">
              <input
                type="radio"
                checked={mode === "range"}
                onChange={() => setMode("range")}
              />
              Custom Range
            </label>
          </div>

          {mode === "range" && (
            <input
              className="mt-6 w-full rounded-lg border border-gray-700 bg-[#0f172a] px-4 py-3 text-white"
              placeholder="Example: 1-3,5,8"
              value={range}
              onChange={(e) =>
                setRange(e.target.value)
              }
            />
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-500/20 p-3 text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl bg-green-500/20 p-3 text-green-300">
            {success}
          </div>
        )}

        <button
          disabled={loading}
          onClick={handleSplit}
          className="mt-8 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Splitting..."
            : "Split PDF"}
        </button>
      </div>
    </div>
  );
}