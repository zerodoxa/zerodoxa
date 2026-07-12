import ImagesToPDF from "@/components/pdf/images-to-pdf/ImagesToPDF";

export const metadata = {
  title: "Images to PDF – PDFMedic",
  description: "Convert JPG, PNG, and WebP images to a single PDF. Choose page size, orientation, and margins.",
};

export default function ImagesToPDFPage() {
  return (
    <div className="relative min-h-screen bg-[#030712] pt-32 pb-16 px-6 sm:px-8 lg:px-12">
      <ImagesToPDF />
    </div>
  );
}
