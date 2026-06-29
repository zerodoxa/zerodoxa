import { PDFDocument } from "pdf-lib";

import { validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "./metadataService";

import type {
  DeletePagesItem,
  DeletePagesOptions,
  DeletePagesResult,
} from "@/types/pdf";

export async function prepareDeleteItem(
  file: File
): Promise<DeletePagesItem> {
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

export async function deletePages(
  item: DeletePagesItem,
  options: DeletePagesOptions
): Promise<DeletePagesResult> {
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

    const pagesToDelete = new Set<number>();

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
            pagesToDelete.add(i - 1);
          }
        }
      } else {
        const page = Number(value);

        if (
          !Number.isNaN(page) &&
          page >= 1 &&
          page <= totalPages
        ) {
          pagesToDelete.add(page - 1);
        }
      }
    }

    if (pagesToDelete.size === 0) {
      return {
        success: false,
        error: "No valid pages selected.",
      };
    }

    if (pagesToDelete.size === totalPages) {
      return {
        success: false,
        error: "You cannot delete every page.",
      };
    }

    const newPdf = await PDFDocument.create();

    const keepPages = [];

    for (let i = 0; i < totalPages; i++) {
      if (!pagesToDelete.has(i)) {
        keepPages.push(i);
      }
    }

    const copiedPages = await newPdf.copyPages(
      sourcePdf,
      keepPages
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
        "-pages-deleted.pdf"
      ),
      deletedPages: Array.from(
        pagesToDelete
      ).map((p) => p + 1),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete pages.",
    };
  }
}