import {
  Combine,
  FileOutput,
  FileText,
  Minimize2,
  RotateCw,
  Scissors,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type PdfMedicTool = {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

export type PdfMedicFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const pdfTools: PdfMedicTool[] = [
  {
    title: "Compress PDF",
    description: "Reduce file size while keeping documents crisp and shareable.",
    icon: Minimize2,
    color: "from-emerald-500 to-cyan-500",
  },
  {
    title: "Merge PDF",
    description: "Combine reports, contracts and scans into one organized PDF.",
    icon: Combine,
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Split PDF",
    description: "Extract selected pages or separate large PDFs into focused files.",
    icon: Scissors,
    color: "from-rose-500 to-orange-500",
  },
  {
    title: "PDF to Word",
    description: "Turn PDFs into editable documents for quick revisions.",
    icon: FileText,
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    title: "Word to PDF",
    description: "Create polished PDFs from editable source documents.",
    icon: FileOutput,
    color: "from-amber-500 to-yellow-500",
  },
  {
    title: "Rotate Pages",
    description: "Fix sideways scans and reorder document flow with confidence.",
    icon: RotateCw,
    color: "from-sky-500 to-blue-500",
  },
];

export const pdfFeatures: PdfMedicFeature[] = [
  {
    title: "Privacy First",
    description: "Built around secure file handling and minimal data exposure.",
    icon: ShieldCheck,
  },
  {
    title: "Fast Workflows",
    description: "Designed for common PDF tasks without heavyweight desktop tools.",
    icon: Sparkles,
  },
  {
    title: "Product Ready",
    description: "Structured as a reusable module for upcoming Medic products.",
    icon: FileText,
  },
];
