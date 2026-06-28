export interface SplitPdfItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: number;
  status: "ready" | "error";
  error?: string;
}

export interface SplitPdfOptions {
  mode: "all" | "range";
  range?: string;
}

export interface SplitPdfResult {
  success: boolean;
  files?: Blob[];
  fileNames?: string[];
  error?: string;
}