import CompressPDF from "@/components/pdf/CompressPDF";

export default function CompressPage() {
  return (
    <div className="relative min-h-screen bg-[#030712] pt-32 pb-16 px-6 sm:px-8 lg:px-12">
      <CompressPDF />
    </div>
  );
}