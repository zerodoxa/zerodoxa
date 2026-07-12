import {
  Combine,
  FileOutput,
  FileText,
  Grid,
  ImageIcon,
  Minimize2,
  RotateCw,
  Scissors,
  ShieldCheck,
  Sparkles,
  LucideIcon,
  ArrowUpDown,
} from "lucide-react";

export type PdfMedicTool = {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  href: string;
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
    href: "/pdfmedic/compress",
  },
  {
    title: "Merge PDF",
    description: "Combine reports, contracts and scans into one organized PDF.",
    icon: Combine,
    color: "from-blue-500 to-indigo-500",
    href: "/pdfmedic/merge",
  },
  {
    title: "Split PDF",
    description: "Extract selected pages or separate large PDFs into focused files.",
    icon: Scissors,
    color: "from-rose-500 to-orange-500",
    href: "/pdfmedic/split",
  },
  {
    title: "Protect PDF",
    description: "Add passwords to secure your documents.",
    icon: ShieldCheck,
    color: "from-violet-500 to-fuchsia-500",
    href: "/pdfmedic/protect",
  },
  {
    title: "Unlock PDF",
    description: "Remove passwords from your PDFs.",
    icon: FileOutput,
    color: "from-amber-500 to-yellow-500",
    href: "/pdfmedic/unlock",
  },
  {
    title: "Rotate Pages",
    description: "Fix sideways scans and reorder document flow with confidence.",
    icon: RotateCw,
    color: "from-sky-500 to-blue-500",
    href: "/pdfmedic/rotate",
  },
  {
    title: "Images to PDF",
    description: "Turn JPG, PNG, and WebP images into a polished PDF in seconds.",
    icon: ImageIcon,
    color: "from-pink-500 to-rose-500",
    href: "/pdfmedic/images-to-pdf",
  },
  {
    title: "Organize Pages",
    description: "Reorder, rotate, and delete pages to clean up your documents.",
    icon: Grid,
    color: "from-purple-500 to-indigo-500",
    href: "/pdfmedic/organize",
  },
  {
    title: "PDF to Images",
    description: "Extract every page of your PDF into high-quality JPEG or PNG images.",
    icon: FileOutput, // Or Image, but FileOutput works too
    color: "from-violet-500 to-purple-500",
    href: "/pdfmedic/pdf-to-images",
  },
  {
    title: "Reorder Pages",
    description: "Drag and drop to quickly arrange PDF pages in the perfect order.",
    icon: ArrowUpDown,
    color: "from-fuchsia-500 to-pink-500",
    href: "/pdfmedic/reorder",
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
