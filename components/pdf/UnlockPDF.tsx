"use client";

import { useState, useCallback, ChangeEvent, DragEvent, useRef } from "react";
import Button from "@/components/ui/Button";
import { FilePlus2, LockOpen } from "lucide-react";

export default function UnlockPDF() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [password, setPassword] = useState("");

  const handleFiles = useCallback((incoming: FileList | File[] | null | undefined) => {
    if (!incoming || incoming.length === 0) return;
    const selectedFile = Array.from(incoming)[0];
    if (selectedFile.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }
    setFile(selectedFile);
    setError("");
    setSuccess("");
  }, []);

  const dragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const dragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const drop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const chooseFiles = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const handleUnlock = async () => {
    if (!file) {
      setError("Choose a PDF first.");
      return;
    }
    if (!password) {
      setError("Password is required to unlock the PDF.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);

      const response = await fetch("/api/pdf/unlock", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to unlock PDF.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const originalName = file.name.replace(/\.pdf$/i, "");
      link.download = `unlocked-${originalName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess("PDF unlocked and downloaded successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pt-32 pb-24">
      <div
        onDragOver={dragOver}
        onDragLeave={dragLeave}
        onDrop={drop}
        className={`mx-auto max-w-4xl rounded-4xl border border-dashed p-8 text-center transition-all duration-300 ${
          isDragging
            ? "border-amber-400 bg-amber-500/10"
            : "border-amber-400/40 bg-white/5"
        }`}
      >
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-600/20">
          <LockOpen className="h-12 w-12 text-amber-400" />
        </div>

        <h2 className="mt-8 text-4xl font-bold text-white">Unlock PDF</h2>
        <p className="mt-4 text-gray-400">Remove password protection from your PDF document.</p>

        <div className="mt-10 flex justify-center">
          <Button onClick={() => fileInputRef.current?.click()}>
            <span className="inline-flex items-center gap-2">
              <FilePlus2 className="h-5 w-5" />
              Choose PDF
            </span>
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={chooseFiles}
            className="hidden"
          />
        </div>

        {file && (
          <div className="mt-8 rounded-xl border border-amber-500/20 bg-black/20 p-5 text-left">
            <p className="text-lg font-semibold text-white">{file.name}</p>
            <p className="mt-2 text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-gray-700 p-6 text-left max-w-md mx-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-700 bg-[#0f172a] px-4 py-2 text-white"
                placeholder="Enter password to unlock"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-auto mt-6 max-w-md rounded-xl bg-red-500/20 p-3 text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mx-auto mt-6 max-w-md rounded-xl bg-green-500/20 p-3 text-green-300">
            {success}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button
            disabled={loading || !file}
            onClick={handleUnlock}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {loading ? "Unlocking..." : "Unlock PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
