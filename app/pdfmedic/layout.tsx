import type { Metadata } from "next";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import ScrollProgress from "@/components/layout/ScrollProgress";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

import { PDFMedicProvider } from "./context/PDFMedicContext";

export const metadata: Metadata = {
  title: "PDFMedic | Zerodoxa",
  description: "Fast, secure PDF tools for everyday document workflows.",
};

export default function PDFMedicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative overflow-hidden bg-[#030712] text-white">
      <ScrollProgress />
      <AnimatedBackground />
      <Navbar />
      <PDFMedicProvider>{children}</PDFMedicProvider>
      <Footer />
    </main>
  );
}
