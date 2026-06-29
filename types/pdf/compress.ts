export interface CompressPdfItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: number;
  status: "ready" | "error";
  error?: string;
}

export interface CompressPdfOptions {
  quality: number;
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