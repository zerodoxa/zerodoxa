import { PDFDocument, degrees } from "pdf-lib";

import { validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "./metadataService";

import type {
  RotatePdfItem,
  RotatePdfOptions,
  RotatePdfResult,
} from "@/types/pdf";

export async function prepareRotateItem(
  file: File
): Promise<RotatePdfItem> {
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

export async function rotatePdf(
  item: RotatePdfItem,
  options: RotatePdfOptions
): Promise<RotatePdfResult> {
  try {
    const bytes = await item.file.arrayBuffer();

    const pdf = await PDFDocument.load(bytes);

    pdf.getPages().forEach((page) => {
      page.setRotation(degrees(options.angle));
    });

    const savedBytes = await pdf.save({
      useObjectStreams: true,
    });

    const pdfArray =
      savedBytes instanceof Uint8Array
        ? savedBytes
        : new Uint8Array(savedBytes);

    const pdfBuffer = pdfArray.buffer.slice(
      pdfArray.byteOffset,
      pdfArray.byteOffset + pdfArray.byteLength
    ) as ArrayBuffer;

    const blob = new Blob([pdfBuffer], {
      type: "application/pdf",
    });

    return {
      success: true,
      blob,
      fileName: item.name.replace(
        /\.pdf$/i,
        "-rotated.pdf"
      ),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Rotation failed.",
    };
  }
}