"use client";

import { useState, useCallback, ChangeEvent, DragEvent, useRef } from "react";
import Button from "@/components/ui/Button";
import { FilePlus2, Shield } from "lucide-react";

export default function ProtectPDF() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userPassword, setUserPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [encryptionLevel, setEncryptionLevel] = useState<"aes-128" | "aes-256">("aes-256");

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

  const handleProtect = async () => {
    if (!file) {
      setError("Choose a PDF first.");
      return;
    }
    if (!userPassword) {
      setError("User password is required.");
      return;
    }
    if (userPassword.length < 8) {
      setError("User password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userPassword", userPassword);
      if (ownerPassword) formData.append("ownerPassword", ownerPassword);
      formData.append("encryptionLevel", encryptionLevel);

      const response = await fetch("/api/pdf/protect", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to protect PDF.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const originalName = file.name.replace(/\.pdf$/i, "");
      link.download = `protected-${originalName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess("PDF protected and downloaded successfully.");
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
            ? "border-violet-400 bg-violet-500/10"
            : "border-violet-400/40 bg-white/5"
        }`}
      >
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-violet-600/20">
          <Shield className="h-12 w-12 text-violet-400" />
        </div>

        <h2 className="mt-8 text-4xl font-bold text-white">Protect PDF</h2>
        <p className="mt-4 text-gray-400">Add a password and encrypt your PDF document.</p>

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
          <div className="mt-8 rounded-xl border border-violet-500/20 bg-black/20 p-5 text-left">
            <p className="text-lg font-semibold text-white">{file.name}</p>
            <p className="mt-2 text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-gray-700 p-6 text-left max-w-md mx-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                User Password (Required)
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-700 bg-[#0f172a] px-4 py-2 text-white"
                placeholder="At least 8 characters"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Owner Password (Optional)
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-700 bg-[#0f172a] px-4 py-2 text-white"
                placeholder="Used for permissions"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
              />
            </div>
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Encryption Level
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-white text-sm">
                  <input
                    type="radio"
                    checked={encryptionLevel === "aes-128"}
                    onChange={() => setEncryptionLevel("aes-128")}
                  />
                  AES-128
                </label>
                <label className="flex items-center gap-2 text-white text-sm">
                  <input
                    type="radio"
                    checked={encryptionLevel === "aes-256"}
                    onChange={() => setEncryptionLevel("aes-256")}
                  />
                  AES-256
                </label>
              </div>
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
            onClick={handleProtect}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {loading ? "Protecting..." : "Protect PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
