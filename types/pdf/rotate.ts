export interface RotatePdfItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: number;
  status: "ready" | "error";
  error?: string;
}

export interface RotatePdfOptions {
  angle: 90 | 180 | 270;
}

export interface RotatePdfResult {
  success: boolean;
  blob?: Blob;
  fileName?: string;
  error?: string;
}