export type SplitMode =
  | "everyPage"
  | "pageRanges"
  | "selectedPages";

export interface PageRange {
  start: number;
  end: number;
}

export interface SplitOptions {
  mode: SplitMode;

  /**
   * Used when mode === "pageRanges"
   */
  ranges?: PageRange[];

  /**
   * Used when mode === "selectedPages"
   */
  selectedPages?: number[];
}

export interface SplitResult {
  fileName: string;
  pdfBytes: Uint8Array;
}
export interface SplitPdfResponse {
  success: boolean;
  files?: SplitResult[];
  error?: string;
}