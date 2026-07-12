"use client";

import { useState } from "react";
import { Minimize2, Zap, Settings, ShieldAlert, Download, RefreshCw } from "lucide-react";
import PDFUpload from "@/components/pdf/PDFUpload";
import Button from "@/components/ui/Button";
import SuccessAlert from "@/components/pdf/SuccessAlert";
import ErrorAlert from "@/components/pdf/ErrorAlert";
import { formatFileSize } from "@/lib/pdf/validation";

type CompressionLevel = "low" | "medium" | "high";

interface LevelConfig {
  id: CompressionLevel;
  title: string;
  description: string;
  estimate: string;
  icon: typeof Zap;
  color: string;
  badge?: string;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  {
    id: "low",
    title: "Low Compression",
    description: "High quality, slightly larger files. Best for print-quality documents.",
    estimate: "~10% - 20% reduction",
    icon: Settings,
    color: "from-blue-500/20 to-cyan-500/20 hover:border-cyan-500/50",
  },
  {
    id: "medium",
    title: "Medium Compression",
    description: "Balanced quality and size. Best for sharing via emails or chats.",
    estimate: "~30% - 50% reduction",
    icon: Zap,
    color: "from-emerald-500/20 to-teal-500/20 hover:border-emerald-500/50",
    badge: "Recommended",
  },
  {
    id: "high",
    title: "High Compression",
    description: "Maximum compression. Smallest file size, quality might be reduced.",
    estimate: "~60% - 80% reduction",
    icon: ShieldAlert,
    color: "from-amber-500/20 to-orange-500/20 hover:border-orange-500/50",
  },
];

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Metrics state
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [savings, setSavings] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string | null>(null);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setError("");
    setSuccess("");
    resetMetrics();
  };

  const handleFileRemoved = () => {
    setFile(null);
    setError("");
    setSuccess("");
    resetMetrics();
  };

  const resetMetrics = () => {
    setOriginalSize(null);
    setCompressedSize(null);
    setSavings(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    setDownloadName(null);
  };

  const handleCompress = async () => {
    if (!file) {
      setError("Please choose a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    resetMetrics();

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("compressionLevel", level);

      const response = await fetch("/api/pdf/compress", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to compress PDF.");
      }

      // Extract details from custom headers
      const original = Number(response.headers.get("X-Original-Size")) || file.size;
      const compressed = Number(response.headers.get("X-Compressed-Size")) || 0;
      const rawSavings = Number(response.headers.get("X-Savings")) || 0;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const originalName = file.name.replace(/\.pdf$/i, "");
      const finalName = `${originalName}-compressed.pdf`;

      setOriginalSize(original);
      setCompressedSize(compressed);
      setSavings(rawSavings);
      setDownloadUrl(url);
      setDownloadName(finalName);

      // Trigger automatic download
      const link = document.createElement("a");
      link.href = url;
      link.download = finalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess("PDF compressed and downloaded successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred during compression.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="group mx-auto max-w-4xl rounded-4xl border border-dashed border-emerald-400/40 bg-white/5 p-6 text-center backdrop-blur-xl transition-all duration-300 md:p-12">
        
        {/* Header Section */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-600/20 transition-all duration-300 md:h-28 md:w-28 group-hover:scale-105">
          <Minimize2 className="h-12 w-12 text-emerald-400 md:h-14 md:w-14" />
        </div>

        <h2 className="mt-8 text-3xl font-extrabold text-white md:text-5xl">Compress PDF</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-400">
          Optimize your PDFs by reducing their file size while preserving layout, text, and graphics.
        </p>

        {/* Upload box */}
        <div className="mt-10">
          <PDFUpload
            disabled={loading}
            onFileSelected={handleFileSelected}
            onFileRemoved={handleFileRemoved}
          />
        </div>

        {/* Compression Level Controls - visible when file is loaded */}
        {file && !loading && !savings && (
          <div className="mt-12 text-left">
            <h3 className="text-xl font-bold text-white mb-6">Select Compression Level</h3>
            
            <div className="grid gap-6 md:grid-cols-3">
              {LEVEL_CONFIGS.map((config) => {
                const Icon = config.icon;
                const isSelected = level === config.id;
                
                return (
                  <div
                    key={config.id}
                    onClick={() => setLevel(config.id)}
                    className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-300 bg-gradient-to-br ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                        : "border-gray-800 bg-black/10 hover:bg-white/[0.02]"
                    } ${config.color}`}
                  >
                    {config.badge && (
                      <span className="absolute top-3 right-3 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                        {config.badge}
                      </span>
                    )}
                    
                    <div className={`inline-flex p-3 rounded-xl ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <h4 className="mt-4 text-lg font-bold text-white">{config.title}</h4>
                    <p className="mt-2 text-sm text-gray-400 leading-snug">{config.description}</p>
                    
                    <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Estimated Reduction</span>
                      <span className="text-emerald-400 font-bold">{config.estimate}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Trigger Button */}
            <div className="mt-10 flex justify-center">
              <Button
                disabled={loading}
                onClick={handleCompress}
                className="w-full sm:w-auto min-w-[240px] bg-emerald-600 hover:bg-emerald-700 hover:shadow-[0_10px_30px_rgba(16,185,129,0.25)] focus-visible:ring-emerald-500"
              >
                Compress PDF
              </Button>
            </div>
          </div>
        )}

        {/* Loading State Overlay */}
        {loading && (
          <div className="mt-10 py-12 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
              <Minimize2 className="absolute h-6 w-6 animate-pulse text-emerald-400" />
            </div>
            <p className="mt-6 text-lg font-semibold text-white animate-pulse">Compressing PDF document...</p>
            <p className="mt-2 text-sm text-gray-400">Recompressing streams and consolidating layout objects</p>
          </div>
        )}

        {/* Success / Metrics Box */}
        {savings !== null && !loading && (
          <div className="mt-10 rounded-3xl border border-emerald-500/20 bg-emerald-950/10 p-8 text-left max-w-2xl mx-auto shadow-lg backdrop-blur-md">
            <h3 className="text-2xl font-bold text-white mb-6">Compression Metrics</h3>
            
            <div className="grid gap-6 sm:grid-cols-3 mb-8">
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                <span className="text-xs text-gray-500 font-medium block">Original Size</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {originalSize !== null ? formatFileSize(originalSize) : "N/A"}
                </span>
              </div>
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                <span className="text-xs text-gray-500 font-medium block">Compressed Size</span>
                <span className="text-xl font-bold text-emerald-400 mt-1 block">
                  {compressedSize !== null ? formatFileSize(compressedSize) : "N/A"}
                </span>
              </div>
              <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
                <span className="text-xs text-emerald-500/60 font-semibold block">Total Savings</span>
                <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
                  {savings}%
                </span>
              </div>
            </div>

            {/* Savings Progress Visualization */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Compressed ({100 - Math.round(savings ?? 0)}%)</span>
                <span>Saved ({Math.round(savings ?? 0)}%)</span>
              </div>
              <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${100 - (savings ?? 0)}%` }} />
                <div className="bg-emerald-500/20 h-full animate-pulse" style={{ width: `${savings ?? 0}%` }} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {downloadUrl && downloadName && (
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = downloadUrl;
                    link.download = downloadName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 hover:shadow-[0_10px_30px_rgba(16,185,129,0.25)] focus-visible:ring-emerald-500"
                >
                  <Download className="h-5 w-5" />
                  Download Compressed PDF
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={resetMetrics}
                className="flex items-center justify-center gap-2 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/5 text-emerald-300"
              >
                <RefreshCw className="h-4 w-4" />
                Compress Again
              </Button>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && <SuccessAlert message={success} />}

        {/* Error Alert */}
        {error && <ErrorAlert message={error} />}

      </div>
    </div>
  );
}