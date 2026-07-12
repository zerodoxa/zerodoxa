import { Metadata } from "next";
import PdfToImages from "@/components/pdf/pdf-to-images/PdfToImages";

export const metadata: Metadata = {
  title: "PDF to Images | Convert PDF pages to JPG or PNG",
  description:
    "Convert every page of your PDF into high-quality JPEG or PNG images for free.",
};

export default function PdfToImagesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PdfToImages />
    </div>
  );
}
