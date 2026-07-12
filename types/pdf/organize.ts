/**
 * Shared type for a single page entry in an organize-pages request.
 * Mirrors the server-side `OrganizePdfPage` in `organizePdfService.ts`.
 */
export interface OrganizePdfPageConfig {
  /** 0-indexed original page number in the source PDF. */
  originalIndex: number;
  /** Clockwise rotation in degrees: 0 | 90 | 180 | 270. */
  rotation: 0 | 90 | 180 | 270;
}

export interface OrganizePdfResult {
  success: boolean;
  blob?: Blob;
  fileName?: string;
  error?: string;
}
