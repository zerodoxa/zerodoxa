import { PDFDocument } from "pdf-lib";

import { validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "./metadataService";

import type {
  CompressPdfItem,
  CompressPdfOptions,
  CompressPdfResult,
} from "@/types/pdf";

export async function prepareCompressItem(
  file: File
): Promise<CompressPdfItem> {
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

export async function compressPdf(
  item: CompressPdfItem,
  options: CompressPdfOptions
): Promise<CompressPdfResult> {
  try {
    const bytes = await item.file.arrayBuffer();

    const pdf = await PDFDocument.load(bytes);

    const compressedBytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });

    const pdfArray =
      compressedBytes instanceof Uint8Array
        ? compressedBytes
        : new Uint8Array(compressedBytes);

    const pdfBuffer = pdfArray.buffer.slice(
      pdfArray.byteOffset,
      pdfArray.byteOffset + pdfArray.byteLength
    ) as ArrayBuffer;

    const blob = new Blob([pdfBuffer], {
      type: "application/pdf",
    });

    const originalSize = item.size;
    const compressedSize = blob.size;

    const rawSavings =
      originalSize > 0
        ? ((originalSize - compressedSize) /
            originalSize) *
          100
        : 0;

    const savings = Math.max(
      0,
      Number(rawSavings.toFixed(1))
    );

    return {
      success: true,
      blob,
      fileName: item.name.replace(
        /\.pdf$/i,
        "-compressed.pdf"
      ),
      originalSize,
      compressedSize,
      savings,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Compression failed.",
    };
  }
}