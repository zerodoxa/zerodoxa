export interface DeletePagesItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: number;
  status: "ready" | "error";
  error?: string;
}

export interface DeletePagesOptions {
  pages: string;
}

export interface DeletePagesResult {
  success: boolean;
  blob?: Blob;
  fileName?: string;
  deletedPages?: number[];
  error?: string;
}