import {
  FileText,
  FileOutput,
 Minimize2,
  Combine,
  Image,
  ScanText,
} from "lucide-react";

export const tools = [
  {
    title: "PDF to Word",
    description: "Convert PDF documents into editable Word files instantly.",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Word to PDF",
    description: "Create high-quality PDFs from Word documents.",
    icon: FileOutput,
    color: "from-violet-500 to-purple-500",
  },
  {
    title: "Compress PDF",
    description: "Reduce PDF size without sacrificing quality.",
    icon: Minimize2,
    color: "from-emerald-500 to-green-500",
  },
  {
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document.",
    icon: Combine,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Image Converter",
    description: "Convert PNG, JPG and WEBP images instantly.",
    icon: Image,
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "OCR Scanner",
    description: "Extract editable text from scanned images and PDFs.",
    icon: ScanText,
    color: "from-yellow-500 to-amber-500",
  },
];