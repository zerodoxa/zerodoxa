"use client";

import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-rose-300">
      <AlertCircle className="h-5 w-5 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
