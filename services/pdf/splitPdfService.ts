import { PDFDocument } from "pdf-lib";

import { validatePdfFile } from "@/lib/pdf/validation";
import type {
  SplitPdfItem,
  SplitPdfOptions,
  SplitPdfResult,
} from "@/types/pdf";

import { extractPdfMetadata } from "./metadataService";

export async function prepareSplitItems(
  files: File[]
): Promise<SplitPdfItem[]> {
  const items: SplitPdfItem[] = [];

  for (const file of files) {
    const validation = validatePdfFile(file);

    if (!validation.isValid) {
      items.push({
        id: `${file.name}-${Date.now()}-${items.length}`,
        file,
        name: file.name,
        size: file.size,
        pages: 0,
        status: "error",
        error: validation.error ?? "Invalid PDF file.",
      });
      continue;
    }

    try {
      const metadata = await extractPdfMetadata(file);

      if (!metadata.success || !metadata.metadata) {
        throw new Error(metadata.error ?? "Unable to read PDF.");
      }

      items.push({
        id: `${file.name}-${Date.now()}-${items.length}`,
        file,
        name: metadata.metadata.fileName,
        size: metadata.metadata.fileSize,
        pages: metadata.metadata.pageCount ?? 0,
        status: "ready",
      });
    } catch (error) {
      items.push({
        id: `${file.name}-${Date.now()}-${items.length}`,
        file,
        name: file.name,
        size: file.size,
        pages: 0,
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Invalid or corrupted PDF.",
      });
    }
  }

  return items;
}

export async function splitPdf(
  item: SplitPdfItem,
  options: SplitPdfOptions
): Promise<SplitPdfResult> {
  try {
    const sourceBytes = await item.file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(sourceBytes);

    const outputFiles: Blob[] = [];
    const fileNames: string[] = [];

    let pageIndexes: number[] = [];

    if (options.mode === "all") {
      pageIndexes = sourcePdf.getPageIndices();
    } else {
      if (!options.range?.trim()) {
        return {
          success: false,
          error: "Please enter a page range.",
        };
      }

      const parts = options.range.split(",");

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
            pageIndexes.push(i - 1);
          }
        } else {
          const page = Number(value);

          if (!Number.isNaN(page)) {
            pageIndexes.push(page - 1);
          }
        }
      }

      pageIndexes = [...new Set(pageIndexes)].filter(
        (page) =>
          page >= 0 && page < sourcePdf.getPageCount()
      );
    }
    pageIndexes = [...new Set(pageIndexes)].filter(
  (page) =>
    page >= 0 && page < sourcePdf.getPageCount()
);

if (pageIndexes.length === 0) {
  return {
    success: false,
    error: "No valid pages found in the selected range.",
  };
}

    for (const pageIndex of pageIndexes) {
      const pdf = await PDFDocument.create();

      const [page] = await pdf.copyPages(sourcePdf, [
        pageIndex,
      ]);

      pdf.addPage(page);

      const savedBytes = await pdf.save();

      const pdfArray =
        savedBytes instanceof Uint8Array
          ? savedBytes
          : new Uint8Array(savedBytes);

      const pdfBuffer = pdfArray.buffer.slice(
        pdfArray.byteOffset,
        pdfArray.byteOffset + pdfArray.byteLength
      ) as ArrayBuffer;

      outputFiles.push(
        new Blob([pdfBuffer], {
          type: "application/pdf",
        })
      );

      fileNames.push(
        `${item.name.replace(
          /\.pdf$/i,
          ""
        )}-page-${pageIndex + 1}.pdf`
      );
    }

    return {
      success: true,
      files: outputFiles,
      fileNames,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to split PDF.",
    };
  }
}