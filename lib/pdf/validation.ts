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

export function parsePages(pagesInput: string, totalPagesCount: number): { pagesToDelete: Set<number>; errors: string[] } {
  const pagesToDelete = new Set<number>();
  const errors: string[] = [];
  const trimmedInput = pagesInput.trim();

  if (!trimmedInput) {
    errors.push("Page selection cannot be empty.");
    return { pagesToDelete, errors };
  }

  // Regex to validate that the input contains ONLY numbers, commas, hyphens, and whitespace.
  if (!/^[0-9,\-\s]+$/.test(trimmedInput)) {
    errors.push("Invalid characters in page selection. Use numbers, commas, and hyphens (e.g., 1,3,5-8).");
    return { pagesToDelete, errors };
  }

  const parts = trimmedInput.split(",");
  for (const part of parts) {
    const cleanPart = part.trim();
    if (!cleanPart) continue;

    if (cleanPart.includes("-")) {
      const rangeParts = cleanPart.split("-");
      if (rangeParts.length !== 2) {
        errors.push(`Invalid range format: "${cleanPart}"`);
        continue;
      }
      const start = parseInt(rangeParts[0].trim(), 10);
      const end = parseInt(rangeParts[1].trim(), 10);

      if (isNaN(start) || isNaN(end)) {
        errors.push(`Invalid numbers in range: "${cleanPart}"`);
        continue;
      }
      if (start <= 0 || end <= 0) {
        errors.push(`Page numbers must be greater than 0: "${cleanPart}"`);
        continue;
      }
      if (start > end) {
        errors.push(`Start page cannot be greater than end page in range: "${cleanPart}"`);
        continue;
      }
      if (start > totalPagesCount || end > totalPagesCount) {
        errors.push(`Range "${cleanPart}" exceeds document boundaries (max page: ${totalPagesCount})`);
        continue;
      }

      for (let i = start; i <= end; i++) {
        pagesToDelete.add(i);
      }
    } else {
      const page = parseInt(cleanPart, 10);
      if (isNaN(page)) {
        errors.push(`Invalid page number: "${cleanPart}"`);
        continue;
      }
      if (page <= 0) {
        errors.push(`Page numbers must be greater than 0: "${cleanPart}"`);
        continue;
      }
      if (page > totalPagesCount) {
        errors.push(`Page ${page} exceeds document boundaries (max page: ${totalPagesCount})`);
        continue;
      }
      pagesToDelete.add(page);
    }
  }

  return { pagesToDelete, errors };
}
