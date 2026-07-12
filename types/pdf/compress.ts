export interface CompressPdfItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: number;
  status: "ready" | "error";
  error?: string;
}

export type CompressionLevel = "low" | "medium" | "high";

export interface CompressPdfOptions {
  level: CompressionLevel;
}

export interface CompressPdfResult {
  success: boolean;
  blob?: Blob;
  fileName?: string;
  originalSize?: number;
  compressedSize?: number;
  savings?: number;
  error?: string;
}