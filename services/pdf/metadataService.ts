import type { PdfParseResult } from "@/types/pdf";

function formatPdfDate(value?: string): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();

  if (!trimmed) return undefined;

  const match = trimmed.match(
    /D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/
  );

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`;
  }

  return trimmed;
}

export async function extractPdfMetadata(
  file: File
): Promise<PdfParseResult> {
  if (typeof window === "undefined") {
    return {
      success: false,
      error: "PDF parsing requires a browser environment.",
    };
  }

  try {
    const pdfjs = await import(
      "pdfjs-dist/legacy/build/pdf.mjs"
    );

    // Use worker from public folder
    pdfjs.GlobalWorkerOptions.workerSrc =
      "/pdf.worker.min.mjs";

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
    });

    const pdf = await loadingTask.promise;

    const metadataResult = await pdf
      .getMetadata()
      .catch(() => ({ info: {} }));

    const info =
      (metadataResult.info as Record<
        string,
        unknown
      >) ?? {};

    return {
      success: true,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        pageCount: pdf.numPages,

        pdfVersion:
          (pdf as any)?._pdfInfo?.version
            ? String((pdf as any)._pdfInfo.version)
            : undefined,

        author:
          typeof info.Author === "string"
            ? info.Author
            : undefined,

        title:
          typeof info.Title === "string"
            ? info.Title
            : undefined,

        subject:
          typeof info.Subject === "string"
            ? info.Subject
            : undefined,

        creator:
          typeof info.Creator === "string"
            ? info.Creator
            : undefined,

        creationDate: formatPdfDate(
          typeof info.CreationDate === "string"
            ? info.CreationDate
            : undefined
        ),

        modificationDate: formatPdfDate(
          typeof info.ModDate === "string"
            ? info.ModDate
            : undefined
        ),
      },
    };
  } catch (error) {
    console.error("PDF Metadata Error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to read PDF.",
    };
  }
}