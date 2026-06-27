import { PDF_PROCESSING_STAGES } from "@/lib/pdf/constants";
import type { ProcessingJob, UploadResponse, UploadedPDF } from "@/types/pdf";

function createUploadedPdf(file: File): UploadedPDF {
  return {
    id: `${file.name}-${Date.now()}`,
    file,
    name: file.name,
    size: file.size,
    type: file.type || "application/pdf",
    uploadedAt: new Date().toISOString(),
    status: "uploading",
  };
}

export async function simulatePdfUpload(file: File): Promise<UploadResponse> {
  const uploadedFile = createUploadedPdf(file);
  const job: ProcessingJob = {
    id: uploadedFile.id,
    operation: "upload",
    status: "processing",
    progress: 15,
    stage: PDF_PROCESSING_STAGES[0],
    startedAt: new Date().toISOString(),
  };

  return {
    success: true,
    message: "PDF uploaded successfully and is ready for processing.",
    uploadedFile: {
      ...uploadedFile,
      status: "complete",
    },
    job: {
      ...job,
      progress: 100,
      status: "complete",
      stage: PDF_PROCESSING_STAGES[PDF_PROCESSING_STAGES.length - 1],
      completedAt: new Date().toISOString(),
    },
  };
}
