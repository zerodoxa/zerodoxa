"use client";

interface UploadProgressProps {
  progress: number;
  stage: string;
  isUploading: boolean;
  isProcessing: boolean;
}

export default function UploadProgress({ progress, stage, isUploading, isProcessing }: UploadProgressProps) {
  return (
    <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left">
      <div className="flex items-center justify-between text-sm text-gray-300">
        <span>{isUploading || isProcessing ? "Processing your document" : "Ready to proceed"}</span>
        <span className="font-medium text-cyan-300">{Math.max(0, progress)}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
      {stage ? <p className="mt-3 text-sm text-gray-400">{stage}</p> : null}
    </div>
  );
}
