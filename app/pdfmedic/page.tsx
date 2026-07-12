import CTA from "./components/CTA";
import Features from "./components/Features";
import Hero from "./components/Hero";
import RepairOptions from "./components/RepairOptions";
import ToolGrid from "./components/ToolGrid";
import UploadBox from "./components/UploadBox";

export default function PDFMedicPage() {
  return (
    <>
      <Hero />
      <UploadBox />
      <RepairOptions />
      <ToolGrid />
      <Features />
      <CTA />
    </>
  );
}
