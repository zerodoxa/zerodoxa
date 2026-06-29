import { PDFDocument } from "pdf-lib";

import { validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "./metadataService";

import type {
  ExtractPagesItem,
  ExtractPagesOptions,
  ExtractPagesResult,
} from "@/types/pdf";

export async function prepareExtractItem(
  file: File
): Promise<ExtractPagesItem> {
  const validation = validatePdfFile(file);

  if (!validation.isValid) {
    return {
      id: `${file.name}-${Date.now()}`,
      file,
      name: file.name,
      size: file.size,
      pages: 0,
      status: "error",
      error: validation.error ?? "Invalid PDF.",
    };
  }

  const metadata = await extractPdfMetadata(file);

  if (!metadata.success || !metadata.metadata) {
    return {
      id: `${file.name}-${Date.now()}`,
      file,
      name: file.name,
      size: file.size,
      pages: 0,
      status: "error",
      error: metadata.error ?? "Unable to read PDF.",
    };
  }

  return {
    id: `${file.name}-${Date.now()}`,
    file,
    name: metadata.metadata.fileName,
    size: metadata.metadata.fileSize,
    pages: metadata.metadata.pageCount ?? 0,
    status: "ready",
  };
}

export async function extractPages(
  item: ExtractPagesItem,
  options: ExtractPagesOptions
): Promise<ExtractPagesResult> {
  try {
    if (!options.pages.trim()) {
      return {
        success: false,
        error: "Please enter page numbers.",
      };
    }

    const bytes = await item.file.arrayBuffer();

    const sourcePdf = await PDFDocument.load(bytes);

    const totalPages = sourcePdf.getPageCount();

    const pagesToExtract = new Set<number>();

    const parts = options.pages.split(",");

    for (const part of parts) {
      const value = part.trim();

      if (value.includes("-")) {
        const [start, end] = value.split("-").map(Number);

        if (
          Number.isNaN(start) ||
          Number.isNaN(end) ||
          start > end
        ) {
          continue;
        }

        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= totalPages) {
            pagesToExtract.add(i - 1);
          }
        }
      } else {
        const page = Number(value);

        if (
          !Number.isNaN(page) &&
          page >= 1 &&
          page <= totalPages
        ) {
          pagesToExtract.add(page - 1);
        }
      }
    }

    if (pagesToExtract.size === 0) {
      return {
        success: false,
        error: "No valid pages selected.",
      };
    }

    const newPdf = await PDFDocument.create();

    const copiedPages = await newPdf.copyPages(
      sourcePdf,
      Array.from(pagesToExtract).sort((a, b) => a - b)
    );

    copiedPages.forEach((page) =>
      newPdf.addPage(page)
    );

    const savedBytes = await newPdf.save({
      useObjectStreams: true,
    });

    const pdfArray =
      savedBytes instanceof Uint8Array
        ? savedBytes
        : new Uint8Array(savedBytes);

    const pdfBuffer = pdfArray.buffer.slice(
      pdfArray.byteOffset,
      pdfArray.byteOffset +
        pdfArray.byteLength
    ) as ArrayBuffer;

    const blob = new Blob([pdfBuffer], {
      type: "application/pdf",
    });

    return {
      success: true,
      blob,
      fileName: item.name.replace(
        /\.pdf$/i,
        "-extracted-pages.pdf"
      ),
      extractedPages: Array.from(
        pagesToExtract
      ).map((page) => page + 1),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to extract pages.",
    };
  }
}