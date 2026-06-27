"use client";

import { DragEvent } from "react";
import { GripVertical, Trash2 } from "lucide-react";

import { formatFileSize } from "@/lib/pdf/validation";
import type { MergePdfItem } from "@/types/pdf";

interface MergeListProps {
  items: MergePdfItem[];
  onRemove: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}

export default function MergeList({ items, onRemove, onMove }: MergeListProps) {
  const handleDrop = (event: DragEvent<HTMLDivElement>, toIndex: number) => {
    event.preventDefault();
    const fromIndex = Number(event.dataTransfer.getData("text/plain"));
    if (!Number.isNaN(fromIndex) && fromIndex !== toIndex) {
      onMove(fromIndex, toIndex);
    }
  };
  const hasItems = items.length > 0;

  if (!hasItems) {
    return null;
  }

  return (
    <div className="mt-6 space-y-3">
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={(event) => event.dataTransfer.setData("text/plain", String(index))}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleDrop(event, index)}
          className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-300">
              <GripVertical className="h-4 w-4" />
            </div>
            <div>
              <p className="max-w-[240px] truncate text-sm font-medium text-white">{item.name}</p>
              <p className="text-xs text-gray-400">
                {formatFileSize(item.size)}{item.pages ? ` • ${item.pages} pages` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {item.status === "error" ? (
              <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200">
                {item.error}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
