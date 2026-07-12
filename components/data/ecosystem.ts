import {
  FileText,
  Image,
  ScanText,
  Video,
  Bot,
  Archive,
} from "lucide-react";

export const ecosystems = [
  {
    title: "PDFMedic",
    description: "Convert, merge, split and edit PDF documents effortlessly.",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
    href: "/pdfmedic",
  },
  {
    title: "ImageMedic",
    description: "Compress, resize, enhance and convert images instantly.",
    icon: Image,
    color: "from-pink-500 to-rose-500",
    href: "#",
  },
  {
    title: "OCRMedic",
    description: "Extract editable text from images and scanned documents.",
    icon: ScanText,
    color: "from-violet-500 to-fuchsia-500",
    href: "#",
  },
  {
    title: "VideoMedic",
    description: "Compress, trim and convert videos online.",
    icon: Video,
    color: "from-red-500 to-orange-500",
    href: "#",
  },
  {
    title: "AIMedic",
    description: "Summarize, translate and rewrite documents with AI.",
    icon: Bot,
    color: "from-emerald-500 to-teal-500",
    href: "#",
  },
  {
    title: "FileMedic",
    description: "ZIP, unzip and manage files with powerful utilities.",
    icon: Archive,
    color: "from-yellow-500 to-amber-500",
    href: "#",
  },
];