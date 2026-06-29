"use client";

import {
  useState,
  useCallback,
  ChangeEvent,
  DragEvent,
} from "react";

import {
  Trash2,
  FilePlus2,
} from "lucide-react";

import {
  prepareDeleteItem,
  deletePages,
} from "@/services/pdf/deletePagesService";

import type {
  DeletePagesItem,
  DeletePagesOptions,
} from "@/types/pdf";

export default function DeletePages() {
  const [item, setItem] =
    useState<DeletePagesItem | null>(null);

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
        await prepareDeleteItem(
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

  const handleDelete =
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

      const options: DeletePagesOptions =
        {
          pages,
        };

      const result =
        await deletePages(
          item,
          options
        );

      if (
        !result.success ||
        !result.blob
      ) {
        setError(
          result.error ??
            "Delete failed."
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
        "updated.pdf";

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
        "Pages deleted successfully."
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
        <Trash2 className="h-12 w-12 text-blue-400" />
      </div>

      <h2 className="mt-8 text-4xl font-bold text-white">
        Delete Pages
      </h2>

      <p className="mt-4 text-gray-400">
        Remove selected pages from your PDF.
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
        <label className="block text-left text-white font-semibold">
          Pages to Delete
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
          You can enter single pages, comma-separated pages,
          or page ranges.
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
        onClick={handleDelete}
        disabled={loading}
        className="mt-8 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete Pages"}
      </button>
    </div>
  );
}