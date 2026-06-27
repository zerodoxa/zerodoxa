"use client";

import {
  BrainCircuit,
  CheckCircle2,
  Images,
  ScanText,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

import SlideUp from "@/components/animations/SlideUp";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";

import {
  PDFMedicAdvancedOption,
  usePDFMedic,
} from "../context/PDFMedicContext";

type RepairMode = {
  title: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  color: string;
};

const repairModes: RepairMode[] = [
  {
    title: "Quick Repair",
    description: "Fixes common PDF corruption in seconds.",
    badge: "Fast",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
  },
  {
    title: "AI Deep Repair",
    description: "Advanced AI recovery for severely damaged PDFs.",
    badge: "Recommended",
    icon: BrainCircuit,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "OCR Recovery",
    description: "Recover scanned or image-based PDF documents.",
    badge: "OCR",
    icon: ScanText,
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    title: "Password Removal",
    description: "Remove known password protection before repair.",
    badge: "Secure",
    icon: ShieldCheck,
    color: "from-emerald-500 to-green-500",
  },
  {
    title: "Extract Images",
    description: "Recover embedded images from damaged PDFs.",
    badge: "Media",
    icon: Images,
    color: "from-rose-500 to-orange-500",
  },
];

const advancedOptions: PDFMedicAdvancedOption[] = [
  "Enable AI Optimization",
  "Preserve Metadata",
  "Attempt Font Recovery",
  "Rebuild Broken Links",
  "Recover Embedded Images",
];

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getRepairedFileName = (fileName: string) => {
  const pdfExtension = ".pdf";
  const hasPdfExtension = fileName.toLowerCase().endsWith(pdfExtension);

  if (!hasPdfExtension) {
    return `${fileName}_repaired.pdf`;
  }

  return `${fileName.slice(0, -pdfExtension.length)}_repaired.pdf`;
};

export default function RepairOptions() {
  const {
    selectedFile,
    selectedRepairMode,
    advancedOptions: selectedAdvancedOptions,
    processing,
    progress,
    currentStage,
    repairComplete,
    repairTime,
    setSelectedRepairMode,
    toggleAdvancedOption,
    startRepair,
    cancelRepair,
    resetWorkflow,
  } = usePDFMedic();

  const handleDownload = () => {
    if (!selectedFile) {
      return;
    }

    const repairedPdf = new Blob([selectedFile], {
      type: selectedFile.type || "application/pdf",
    });
    const objectUrl = URL.createObjectURL(repairedPdf);
    const downloadLink = document.createElement("a");

    downloadLink.href = objectUrl;
    downloadLink.download = getRepairedFileName(selectedFile.name);
    downloadLink.style.display = "none";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    URL.revokeObjectURL(objectUrl);
  };

  return (
    <section
      id="repair-options"
      className="relative overflow-hidden bg-[#030712] py-24"
    >
      <div className="absolute left-0 top-16 h-80 w-80 rounded-full bg-blue-600/10 blur-[130px]" />
      <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

      <Container>
        <SlideUp>
          <SectionTitle
            title="Choose Your Repair Mode"
            subtitle="Select how PDFMedic should repair your document."
          />
        </SlideUp>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {repairModes.map((mode, index) => {
            const Icon = mode.icon;
            const isSelected = selectedRepairMode === mode.title;

            return (
              <SlideUp
                key={mode.title}
                delay={index * 0.1}
              >
                <button
                  type="button"
                  onClick={() => setSelectedRepairMode(mode.title)}
                  disabled={processing}
                  aria-pressed={isSelected}
                  className={`group relative flex h-full min-h-[300px] w-full flex-col overflow-hidden rounded-3xl border bg-white/5 p-6 text-left backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(59,130,246,0.25)] ${
                    isSelected
                      ? "border-blue-400/70 shadow-[0_20px_70px_rgba(37,99,235,0.28)]"
                      : "border-white/10 hover:border-blue-400/40"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
                    <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
                  </div>

                  {isSelected && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />
                  )}

                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${mode.color} transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isSelected
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-white/10 text-gray-300"
                        }`}
                      >
                        {mode.badge}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white">
                      {mode.title}
                    </h3>

                    <p className="mt-4 flex-1 leading-7 text-gray-400">
                      {mode.description}
                    </p>

                    <div
                      className={`mt-8 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300 ${
                        isSelected
                          ? "border-blue-400 bg-blue-500"
                          : "border-gray-600 group-hover:border-blue-400"
                      }`}
                    >
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </button>
              </SlideUp>
            );
          })}
        </div>

        <div className="mx-auto mt-12 max-w-5xl">
          {repairComplete && selectedFile ? (
            <div className="rounded-[32px] border border-emerald-400/20 bg-white/5 p-6 text-center backdrop-blur-xl shadow-[0_24px_90px_rgba(16,185,129,0.16)] md:p-10">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/15">
                <CheckCircle2 className="h-14 w-14 text-emerald-400" />
              </div>

              <h3 className="mt-8 text-4xl font-extrabold text-white md:text-5xl">
                Repair Complete
              </h3>

              <p className="mt-4 text-lg font-semibold text-emerald-300">
                Recovered Successfully
              </p>

              <div className="mx-auto mt-8 grid max-w-4xl gap-4 text-left md:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Filename", selectedFile.name],
                  ["File Size", formatFileSize(selectedFile.size)],
                  ["Repair Time", repairTime],
                  ["Repair Quality", "98%"],
                  ["Objects Repaired", "247"],
                  ["Fonts Restored", "12"],
                  ["Metadata Preserved", "Yes"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-[#020617]/50 p-4"
                  >
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-2 break-words font-semibold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  type="button"
                  variant="primary"
                  disabled={!selectedFile}
                  onClick={handleDownload}
                  className="px-10 py-4 text-lg"
                >
                  Download Repaired PDF
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="px-10 py-4 text-lg"
                  onClick={resetWorkflow}
                >
                  Repair Another File
                </Button>
              </div>
            </div>
          ) : processing ? (
            <div className="rounded-[32px] border border-blue-400/20 bg-white/5 p-6 backdrop-blur-xl shadow-[0_24px_90px_rgba(37,99,235,0.16)] md:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-blue-400">
                    Repair in progress
                  </p>
                  <h3 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">
                    {currentStage}
                  </h3>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500">Percentage</p>
                  <p className="text-5xl font-black text-white">
                    {progress}%
                  </p>
                </div>
              </div>

              <div className="mt-10 overflow-hidden rounded-full border border-white/10 bg-[#020617] p-1">
                <div
                  className="h-4 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center">
                <div>
                  <p className="font-semibold text-white">
                    {selectedFile?.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Simulated local workflow. No upload or API request is
                    running.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={cancelRepair}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-3xl font-extrabold text-white">
                    Advanced Options
                  </h3>
                  <p className="mt-2 text-gray-400">
                    Fine tune how PDFMedic should approach the repair.
                  </p>
                </div>

                <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
                  {selectedRepairMode}
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {advancedOptions.map((option) => {
                  const isChecked = selectedAdvancedOptions.includes(option);

                  return (
                    <label
                      key={option}
                      className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-[#020617]/50 p-4 transition-all duration-300 hover:border-blue-400/40 hover:bg-white/[0.07]"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAdvancedOption(option)}
                        className="h-5 w-5 rounded border-gray-700 bg-[#020617] accent-blue-500"
                      />

                      <span className="font-medium text-gray-200 transition-colors duration-300 group-hover:text-white">
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-10 grid gap-4 border-t border-white/10 pt-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="rounded-2xl border border-white/10 bg-[#020617]/50 p-5">
                  {selectedFile ? (
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
                        Ready to Repair
                      </p>
                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-gray-500">Filename</p>
                          <p className="mt-1 break-words font-semibold text-white">
                            {selectedFile.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">File Size</p>
                          <p className="mt-1 font-semibold text-white">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Repair Mode</p>
                          <p className="mt-1 font-semibold text-white">
                            {selectedRepairMode}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
                        File status
                      </p>
                      <p className="mt-2 text-lg font-semibold text-gray-300">
                        No PDF selected
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="primary"
                  disabled={!selectedFile}
                  onClick={startRepair}
                  className="w-full px-10 py-4 text-lg disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
                >
                  Start PDF Repair
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
