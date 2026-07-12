"use client";

import { DragEvent } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { formatFileSize } from "@/lib/pdf/validation";
import type { ImageItem } from "@/types/pdf";

interface ImageListProps {
  items: ImageItem[];
  onRemove: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}

export default function ImageList({ items, onRemove, onMove }: ImageListProps) {
  const handleDrop = (e: DragEvent<HTMLDivElement>, toIndex: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    if (data === "") return;
    const fromIndex = parseInt(data, 10);
    if (!Number.isNaN(fromIndex) && fromIndex !== toIndex) {
      onMove(fromIndex, toIndex);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="mt-6 space-y-2">
      <p className="text-left text-xs font-semibold uppercase tracking-widest text-gray-500">
        {items.length} image{items.length !== 1 ? "s" : ""} — drag to reorder
      </p>

      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => e.dataTransfer.setData("text/plain", String(index))}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, index)}
          className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-left transition hover:border-pink-500/30 hover:bg-pink-500/5"
        >
          {/* Thumbnail */}
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.previewUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Drag handle + name */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-gray-600 group-hover:text-pink-400" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{item.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
            </div>
          </div>

          {/* Page number badge */}
          <span className="shrink-0 rounded-full border border-pink-500/20 bg-pink-500/10 px-2 py-0.5 text-xs font-semibold text-pink-300">
            {index + 1}
          </span>

          {/* Remove button */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
