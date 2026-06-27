"use client";

import SlideUp from "@/components/animations/SlideUp";
import PDFUpload from "@/components/pdf/PDFUpload";
import Container from "@/components/ui/Container";

import { usePDFMedic } from "../context/PDFMedicContext";

export default function UploadBox() {
  const { selectFile } = usePDFMedic();

  return (
    <section
      id="upload"
      className="relative bg-[#030712] py-24"
    >
      <Container>
        <SlideUp>
          <PDFUpload onFileSelected={selectFile} />
        </SlideUp>
      </Container>
    </section>
  );
}
