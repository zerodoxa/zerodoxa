import { MAX_PDF_FILE_SIZE, PDF_MIME_TYPE } from "./constants";
import type { ValidationResult } from "@/types/pdf";

const isPdfFile = (file: File) => {
  const extensionMatches = file.name.toLowerCase().endsWith(".pdf");
  const typeMatches = file.type === PDF_MIME_TYPE || file.type === "application/octet-stream";

  return extensionMatches || typeMatches;
};

export function validatePdfFile(file: File | null | undefined): ValidationResult {
  if (!file) {
    return { isValid: false, error: "Please choose a PDF file to continue." };
  }

  if (!file.name.trim()) {
    return { isValid: false, error: "The selected file is missing a name." };
  }

  if (file.size <= 0) {
    return { isValid: false, error: "The selected PDF appears to be empty." };
  }

  if (!isPdfFile(file)) {
    return { isValid: false, error: "Only PDF files are supported. Please choose a valid document." };
  }

  if (file.size > MAX_PDF_FILE_SIZE) {
    return { isValid: false, error: "This PDF is larger than 100 MB. Please choose a smaller file." };
  }

  return { isValid: true };
}

export function inferPdfPages(file: File): number | undefined {
  if (file.size < 1024) {
    return undefined;
  }

  return Math.max(1, Math.min(999, Math.round(file.size / 180000)));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
