"use client";

import { CheckCircle2 } from "lucide-react";

interface SuccessAlertProps {
  message: string;
}

export default function SuccessAlert({ message }: SuccessAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-emerald-300">
      <CheckCircle2 className="h-5 w-5 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
