export interface ExtractPagesItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: number;
  status: "ready" | "error";
  error?: string;
}

export interface ExtractPagesOptions {
  pages: string;
}

export interface ExtractPagesResult {
  success: boolean;
  blob?: Blob;
  fileName?: string;
  extractedPages?: number[];
  error?: string;
}