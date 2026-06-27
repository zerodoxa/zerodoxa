"use client";

import { useCallback, useMemo, useState } from "react";

import { PDF_PROCESSING_STAGES } from "@/lib/pdf/constants";
import { validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "@/services/pdf/metadataService";
import type { UploadedPDF } from "@/types/pdf";

export function useUploadState() {
  const [uploadedFile, setUploadedFile] = useState<UploadedPDF | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetUpload = useCallback(() => {
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsProcessing(false);
    setProcessingStage("");
    setError("");
    setSuccess("");
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    const validation = validatePdfFile(file);

    if (!validation.isValid) {
      setError(validation.error ?? "Unable to validate this file.");
      setSuccess("");
      return false;
    }

    setError("");
    setSuccess("");
    setIsUploading(true);
    setIsProcessing(true);
    setUploadProgress(20);
    setProcessingStage(PDF_PROCESSING_STAGES[0]);

    try {
      const parseResult = await extractPdfMetadata(file);

      if (!parseResult.success || !parseResult.metadata) {
        throw new Error(parseResult.error ?? "The PDF could not be processed.");
      }

      const uploadedFile: UploadedPDF = {
        id: `${file.name}-${Date.now()}`,
        file,
        name: parseResult.metadata.fileName,
        size: parseResult.metadata.fileSize,
        type: file.type || "application/pdf",
        pages: parseResult.metadata.pageCount,
        uploadedAt: new Date().toISOString(),
        metadata: parseResult.metadata,
        status: "complete",
      };

      setUploadedFile(uploadedFile);
      setUploadProgress(100);
      setIsUploading(false);
      setIsProcessing(false);
      setProcessingStage(PDF_PROCESSING_STAGES[PDF_PROCESSING_STAGES.length - 1]);
      setSuccess(`Loaded ${uploadedFile.name} with ${uploadedFile.pages ?? "unknown"} page${uploadedFile.pages === 1 ? "" : "s"}.`);
      return true;
    } catch (uploadError) {
      setUploadProgress(0);
      setIsUploading(false);
      setIsProcessing(false);
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
      return false;
    }
  }, []);

  const removeUploadedFile = useCallback(() => {
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsProcessing(false);
    setProcessingStage("");
    setError("");
    setSuccess("");
  }, []);

  const replaceUploadedFile = useCallback(async (file: File) => {
    setUploadedFile(null);
    setUploadProgress(0);
    return uploadFile(file);
  }, [uploadFile]);

  return useMemo(
    () => ({
      uploadedFile,
      uploadProgress,
      isUploading,
      isProcessing,
      processingStage,
      error,
      success,
      uploadFile,
      removeUploadedFile,
      replaceUploadedFile,
      resetUpload,
    }),
    [uploadedFile, uploadProgress, isUploading, isProcessing, processingStage, error, success, uploadFile, removeUploadedFile, replaceUploadedFile, resetUpload]
  );
}

export type UseUploadStateReturn = ReturnType<typeof useUploadState>;
