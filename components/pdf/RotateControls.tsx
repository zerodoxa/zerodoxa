"use client";

import { RotateCw, CheckSquare, Square, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";

interface RotateControlsProps {
  selectedCount: number;
  totalCount: number;
  isRotating: boolean;
  hasRotations: boolean;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onRotateSelected: (angle: 90 | 180 | 270) => void;
  onResetAll: () => void;
  onSubmit: () => void;
}

export default function RotateControls({
  selectedCount,
  totalCount,
  isRotating,
  hasRotations,
  onSelectAll,
  onSelectNone,
  onRotateSelected,
  onResetAll,
  onSubmit,
}: RotateControlsProps) {
  const allSelected = selectedCount === totalCount;

  return (
    <div className="mt-8 flex flex-col gap-6 rounded-3xl border border-gray-800 bg-black/25 p-6 text-left">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Selection info and controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={allSelected ? onSelectNone : onSelectAll}
            className="flex items-center gap-2 border-gray-800 hover:border-blue-500 py-2 px-4"
          >
            {allSelected ? (
              <>
                <Square className="h-4 w-4 text-blue-400" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 text-blue-400" />
                Select All ({totalCount})
              </>
            )}
          </Button>

          {selectedCount > 0 && (
            <span className="text-sm font-semibold text-blue-400">
              {selectedCount} page{selectedCount === 1 ? "" : "s"} selected
            </span>
          )}
        </div>

        {/* Global Reset */}
        {hasRotations && (
          <Button
            variant="secondary"
            onClick={onResetAll}
            className="flex items-center gap-2 border-rose-500/20 bg-rose-500/5 text-rose-300 hover:border-rose-500 hover:bg-rose-500/10 py-2 px-4"
          >
            <Trash2 className="h-4 w-4" />
            Reset All Rotations
          </Button>
        )}
      </div>

      <hr className="border-gray-800" />

      {/* Rotation action tools */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 block">
            Rotate Selected Pages
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={() => onRotateSelected(90)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-800 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-blue-500/50 disabled:opacity-40 disabled:pointer-events-none"
            >
              <RotateCw className="h-3.5 w-3.5 text-blue-400" />
              +90°
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={() => onRotateSelected(180)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-800 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-blue-500/50 disabled:opacity-40 disabled:pointer-events-none"
            >
              <RotateCw className="h-3.5 w-3.5 text-blue-400" />
              +180°
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={() => onRotateSelected(270)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-800 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-blue-500/50 disabled:opacity-40 disabled:pointer-events-none"
            >
              <RotateCw className="h-3.5 w-3.5 text-blue-400" />
              +270°
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          <Button
            onClick={onSubmit}
            disabled={isRotating || !hasRotations}
            className="w-full sm:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 hover:shadow-[0_10px_30px_rgba(37,99,235,0.25)]"
          >
            {isRotating ? "Rotating PDF..." : "Rotate PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
