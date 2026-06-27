import { PDFDocument } from "pdf-lib";

import { validatePdfFile } from "@/lib/pdf/validation";
import type { MergePdfItem, MergePdfResult } from "@/types/pdf";

import { extractPdfMetadata } from "./metadataService";

export async function prepareMergeItems(files: File[]): Promise<MergePdfItem[]> {
  const items: MergePdfItem[] = [];

  for (const file of files) {
    const validation = validatePdfFile(file);

    if (!validation.isValid) {
      items.push({
        id: `${file.name}-${Date.now()}-${items.length}`,
        file,
        name: file.name,
        size: file.size,
        status: "error",
        error: validation.error ?? "Invalid PDF file.",
      });
      continue;
    }

    try {
      const parseResult = await extractPdfMetadata(file);

      if (!parseResult.success || !parseResult.metadata) {
        throw new Error(parseResult.error ?? "The PDF could not be read.");
      }

      items.push({
        id: `${file.name}-${Date.now()}-${items.length}`,
        file,
        name: parseResult.metadata.fileName,
        size: parseResult.metadata.fileSize,
        pages: parseResult.metadata.pageCount,
        status: "ready",
      });
    } catch (error) {
      items.push({
        id: `${file.name}-${Date.now()}-${items.length}`,
        file,
        name: file.name,
        size: file.size,
        status: "error",
        error: error instanceof Error ? error.message : "Invalid or corrupted PDF.",
      });
    }
  }

  return items;
}

export async function mergePdfFiles(files: MergePdfItem[]): Promise<MergePdfResult> {
  const validFiles = files.filter((item) => item.status === "ready");

  if (validFiles.length < 2) {
    return {
      success: false,
      error: "Select at least two valid PDFs to merge.",
    };
  }

  try {
    const mergedPdf = await PDFDocument.create();

    for (const item of validFiles) {
      const sourceBytes = await item.file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(sourceBytes);
      const copiedPages = await mergedPdf.copyPages(
        sourcePdf,
        sourcePdf.getPageIndices()
      );

      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    const mergedArray = mergedBytes instanceof Uint8Array ? mergedBytes : new Uint8Array(mergedBytes);
    const mergedBuffer = mergedArray.buffer.slice(
      mergedArray.byteOffset,
      mergedArray.byteOffset + mergedArray.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([mergedBuffer], { type: "application/pdf" });

    return {
      success: true,
      blob,
      fileName: "merged-pdfs.pdf",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "The selected PDFs could not be merged.",
    };
  }
}
