"use client";

import { DragEvent, useCallback, useState } from "react";

import { useUploadState } from "@/hooks/pdf/useUploadState";
import { PDF_PROCESSING_STAGES } from "@/lib/pdf/constants";

import DropZone from "./DropZone";
import FileCard from "./FileCard";
import MetadataGrid from "./MetadataGrid";
import ProcessingOverlay from "./ProcessingOverlay";
import UploadProgress from "./UploadProgress";
import UploadStatus from "./UploadStatus";

interface PDFUploadProps {
  disabled?: boolean;
  onFileSelected?: (file: File) => void;
}

export default function PDFUpload({
  disabled = false,
  onFileSelected,
}: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const {
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
  } = useUploadState();

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      void uploadFile(droppedFile);
    }
  }, [disabled, uploadFile]);

  const handleFileSelect = useCallback(async (file: File | null | undefined) => {
    if (!file) {
      return;
    }

    if (uploadedFile) {
      const success = await replaceUploadedFile(file);
      if (success) {
        onFileSelected?.(file);
      }
      return;
    }

    const success = await uploadFile(file);
    if (success) {
      onFileSelected?.(file);
    }
  }, [onFileSelected, replaceUploadedFile, uploadFile, uploadedFile]);

  const showOverlay = isUploading || isProcessing;

  return (
    <div className="relative">
      <DropZone
        isDragging={isDragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileSelect={handleFileSelect}
        disabled={disabled}
        overlay={showOverlay ? <ProcessingOverlay stage={processingStage || PDF_PROCESSING_STAGES[0]} /> : null}
      >
        <UploadProgress
          progress={uploadProgress}
          stage={processingStage}
          isUploading={isUploading}
          isProcessing={isProcessing}
        />

        <UploadStatus error={error} success={success} />

        {uploadedFile ? (
          <>
            <FileCard
              uploadedFile={uploadedFile}
              onReplace={() => {
                if (uploadedFile.file) {
                  void onFileSelected?.(uploadedFile.file);
                }
              }}
              onRemove={removeUploadedFile}
            />
            {uploadedFile.metadata ? <MetadataGrid metadata={uploadedFile.metadata} /> : null}
          </>
        ) : null}
      </DropZone>
    </div>
  );
}
