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
  prepareExtractItem,
  extractPages,
} from "@/services/pdf/extractPagesService";

import type {
  ExtractPagesItem,
  ExtractPagesOptions,
} from "@/types/pdf";

export default function ExtractPages() {
  const [item, setItem] =
    useState<ExtractPagesItem | null>(null);

  const [pages, setPages] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [isDragging, setDragging] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleFiles = useCallback(
    async (
      incoming:
        | FileList
        | null
        | undefined
    ) => {
      if (!incoming?.length) return;

      const prepared =
        await prepareExtractItem(
          incoming[0]
        );

      setItem(prepared);

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

    void handleFiles(
      e.dataTransfer.files
    );
  };

  const chooseFiles = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    void handleFiles(
      e.target.files
    );

    e.target.value = "";
  };

  const handleExtract =
    async () => {
      if (!item) {
        setError(
          "Choose a PDF first."
        );
        return;
      }

      if (
        item.status === "error"
      ) {
        setError(
          item.error ??
            "Invalid PDF."
        );
        return;
      }

      setLoading(true);

      setError("");

      setSuccess("");

      const options: ExtractPagesOptions =
        {
          pages,
        };

      const result =
        await extractPages(
          item,
          options
        );

      if (
        !result.success ||
        !result.blob
      ) {
        setError(
          result.error ??
            "Extraction failed."
        );

        setLoading(false);

        return;
      }

      const url =
        URL.createObjectURL(
          result.blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        result.fileName ??
        "extracted-pages.pdf";

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        url
      );

      setSuccess(
        "Pages extracted successfully."
      );

      setLoading(false);
    };
      return (
    <div
      onDragOver={dragOver}
      onDragLeave={dragLeave}
      onDrop={drop}
      className={`mx-auto max-w-4xl rounded-[32px] border border-dashed p-8 text-center transition-all duration-300 ${
        isDragging
          ? "border-cyan-400 bg-blue-500/10"
          : "border-blue-400/40 bg-white/5"
      }`}
    >
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-600/20">
        <Scissors className="h-12 w-12 text-blue-400" />
      </div>

      <h2 className="mt-8 text-4xl font-bold text-white">
        Extract Pages
      </h2>

      <p className="mt-4 text-gray-400">
        Extract selected pages into a new PDF.
      </p>

      <label className="mt-10 flex cursor-pointer justify-center">
        <span className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
          <FilePlus2 className="h-5 w-5" />
          Choose PDF
        </span>

        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={chooseFiles}
        />
      </label>

      {item && (
        <div className="mt-8 rounded-xl border border-blue-500/20 bg-black/20 p-5 text-left">
          <p className="text-lg font-semibold text-white">
            {item.name}
          </p>

          <p className="mt-2 text-gray-400">
            {(item.size / 1024 / 1024).toFixed(2)} MB
          </p>

          <p className="text-gray-400">
            {item.pages} Pages
          </p>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-gray-700 p-6">
        <label className="block text-left font-semibold text-white">
          Pages to Extract
        </label>

        <input
          type="text"
          value={pages}
          onChange={(e) =>
            setPages(e.target.value)
          }
          placeholder="Examples: 2,4,6 or 3-8"
          className="mt-4 w-full rounded-xl border border-gray-700 bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-blue-500"
        />

        <p className="mt-3 text-left text-sm text-gray-400">
          Enter page numbers separated by commas or ranges.
        </p>
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
        onClick={handleExtract}
        disabled={loading}
        className="mt-8 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Extracting..." : "Extract Pages"}
      </button>
    </div>
  );
}