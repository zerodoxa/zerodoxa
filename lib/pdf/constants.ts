export const MAX_PDF_FILE_SIZE = 100 * 1024 * 1024;
export const PDF_ACCEPT = "application/pdf,.pdf";
export const PDF_MIME_TYPE = "application/pdf";

export const PDF_PROCESSING_STAGES = [
  "Uploading Document",
  "Analyzing PDF Structure",
  "Repairing Cross References",
  "Recovering Fonts",
  "Optimizing Objects",
  "Finalizing Repair",
  "Generating Download",
] as const;

export const PDF_UPLOAD_STAGES = [
  "Preparing upload",
  "Validating file",
  "Uploading to secure storage",
  "Finishing setup",
] as const;
