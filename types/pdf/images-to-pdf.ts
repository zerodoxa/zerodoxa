export interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  status: "ready" | "error";
  error?: string;
}

export type PageSize = "A4" | "Letter";
export type Orientation = "portrait" | "landscape";
export type MarginSize = "none" | "small" | "medium" | "large";

export interface ImagesToPdfOptions {
  pageSize: PageSize;
  orientation: Orientation;
  margin: MarginSize;
}

export interface ImagesToPdfResult {
  success: boolean;
  blob?: Blob;
  fileName?: string;
  pageCount?: number;
  error?: string;
}
