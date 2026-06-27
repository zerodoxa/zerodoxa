import type { PdfParseResult } from "@/types/pdf";

function formatPdfDate(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const match = trimmed.match(/D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`;
  }

  return trimmed;
}

export async function extractPdfMetadata(file: File): Promise<PdfParseResult> {
  if (typeof window === "undefined") {
    return {
      success: false,
      error: "PDF parsing requires a browser environment.",
    };
  }

  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const { GlobalWorkerOptions, getDocument } = pdfjsLib;

    GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.mjs",
      import.meta.url
    ).toString();

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const info = await pdf.getMetadata().catch(() => ({ info: {} }));
    const metadata = info.info ?? {};

    const pageCount = pdf.numPages;
    const documentInfo = metadata as Record<string, unknown>;

    const result = {
      success: true,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        pageCount,
        pdfVersion: pdf._pdfInfo?.version ? String(pdf._pdfInfo.version) : undefined,
        author: typeof documentInfo.Author === "string" ? documentInfo.Author : undefined,
        title: typeof documentInfo.Title === "string" ? documentInfo.Title : undefined,
        subject: typeof documentInfo.Subject === "string" ? documentInfo.Subject : undefined,
        creator: typeof documentInfo.Creator === "string" ? documentInfo.Creator : undefined,
        creationDate: formatPdfDate(typeof documentInfo.CreationDate === "string" ? documentInfo.CreationDate : undefined),
        modificationDate: formatPdfDate(typeof documentInfo.ModDate === "string" ? documentInfo.ModDate : undefined),
      },
    };

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "The selected PDF appears to be corrupted or unreadable.",
    };
  }
}
