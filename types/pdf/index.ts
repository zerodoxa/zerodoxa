export type ProcessingStatus = "idle" | "uploading" | "processing" | "complete" | "error";

export interface PDFDocumentMetadata {
  fileName: string;
  fileSize: number;
  pageCount?: number;
  pdfVersion?: string;
  author?: string;
  title?: string;
  subject?: string;
  creator?: string;
  creationDate?: string;
  modificationDate?: string;
}

export interface PDFMetadata {
  name: string;
  size: number;
  type: string;
  pages?: number;
  uploadedAt: string;
  metadata?: PDFDocumentMetadata;
}

export interface UploadedPDF extends PDFMetadata {
  id: string;
  file: File;
  status: ProcessingStatus;
}

export interface ProcessingJob {
  id: string;
  operation: "upload" | "compress" | "merge" | "split" | "rotate" | "delete-pages" | "extract-pages";
  status: ProcessingStatus;
  progress: number;
  stage: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  uploadedFile?: UploadedPDF;
  job?: ProcessingJob;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PdfParseResult {
  success: boolean;
  metadata?: PDFDocumentMetadata;
  error?: string;
}

export interface MergePdfItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pages?: number;
  status: "ready" | "error";
  error?: string;
}

export interface MergePdfResult {
  success: boolean;
  blob?: Blob;
  fileName?: string;
  error?: string;
}
