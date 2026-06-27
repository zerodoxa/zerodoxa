import CTA from "./components/CTA";
import Features from "./components/Features";
import Hero from "./components/Hero";
import RepairOptions from "./components/RepairOptions";
import ToolGrid from "./components/ToolGrid";
import UploadBox from "./components/UploadBox";
import MergePDF from "@/components/pdf/MergePDF";

export default function PDFMedicPage() {
  return (
    <>
      <Hero />
      <UploadBox />
      <section className="relative bg-[#030712] px-6 py-16 sm:px-8 lg:px-12">
        <MergePDF />
      </section>
      <RepairOptions />
      <ToolGrid />
      <Features />
      <CTA />
    </>
  );
}
