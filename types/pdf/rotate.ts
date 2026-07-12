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
  rotations: Record<number, number>;
}

export interface RotatePdfResult {
  success: boolean;
  blob?: Blob;
  fileName?: string;
  error?: string;
}