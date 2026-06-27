"use client";

import ErrorAlert from "./ErrorAlert";
import SuccessAlert from "./SuccessAlert";

interface UploadStatusProps {
  error: string;
  success: string;
}

export default function UploadStatus({ error, success }: UploadStatusProps) {
  return (
    <>
      <ErrorAlert message={error} />
      <SuccessAlert message={success} />
    </>
  );
}
