"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type PDFMedicAdvancedOption =
  | "Enable AI Optimization"
  | "Preserve Metadata"
  | "Attempt Font Recovery"
  | "Rebuild Broken Links"
  | "Recover Embedded Images";

type PDFMedicContextValue = {
  selectedFile: File | null;
  selectedRepairMode: string;
  advancedOptions: PDFMedicAdvancedOption[];
  processing: boolean;
  progress: number;
  uploadError: string;
  currentStage: string;
  repairComplete: boolean;
  repairTime: string;
  setSelectedRepairMode: (mode: string) => void;
  toggleAdvancedOption: (option: PDFMedicAdvancedOption) => void;
  selectFile: (file?: File) => void;
  startRepair: () => void;
  cancelRepair: () => void;
  resetWorkflow: () => void;
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const repairStages = [
  "Uploading Document",
  "Analyzing PDF Structure",
  "Repairing Cross References",
  "Recovering Fonts",
  "Optimizing Objects",
  "Finalizing Repair",
  "Generating Download",
];

const PDFMedicContext = createContext<PDFMedicContextValue | null>(null);

export function PDFMedicProvider({ children }: { children: ReactNode }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedRepairMode, setSelectedRepairMode] = useState("Quick Repair");
  const [advancedOptions, setAdvancedOptions] = useState<
    PDFMedicAdvancedOption[]
  >(["Preserve Metadata"]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [currentStage, setCurrentStage] = useState("");
  const [repairComplete, setRepairComplete] = useState(false);
  const [repairTime, setRepairTime] = useState("");
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startedAtRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutRefs.current = [];
  }, []);

  const selectFile = (file?: File) => {
    if (!file) {
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setSelectedFile(null);
      setRepairComplete(false);
      setUploadError("Please choose a PDF file. PDFMedic only accepts .pdf files.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setRepairComplete(false);
      setUploadError("This PDF is larger than 100 MB. Please choose a smaller file.");
      return;
    }

    clearTimers();
    setSelectedFile(file);
    setUploadError("");
    setProcessing(false);
    setProgress(0);
    setCurrentStage("");
    setRepairComplete(false);
    setRepairTime("");
  };

  const toggleAdvancedOption = (option: PDFMedicAdvancedOption) => {
    setAdvancedOptions((currentOptions) =>
      currentOptions.includes(option)
        ? currentOptions.filter((item) => item !== option)
        : [...currentOptions, option]
    );
  };

  const startRepair = () => {
    if (!selectedFile || processing) {
      return;
    }

    clearTimers();
    startedAtRef.current = Date.now();
    setProcessing(true);
    setProgress(0);
    setCurrentStage(repairStages[0]);
    setRepairComplete(false);
    setRepairTime("");

    repairStages.slice(1).forEach((stage, index) => {
      const timeoutId = setTimeout(() => {
        setCurrentStage(stage);
        setProgress(Math.round(((index + 1) / repairStages.length) * 100));
      }, (index + 1) * 1000);

      timeoutRefs.current.push(timeoutId);
    });

    const completeTimeoutId = setTimeout(() => {
      const startedAt = startedAtRef.current ?? Date.now();
      const seconds = Math.max(
        1,
        Math.round((Date.now() - startedAt) / 1000)
      );

      setProgress(100);
      setProcessing(false);
      setRepairComplete(true);
      setRepairTime(`${seconds}s`);
      setCurrentStage("");
    }, repairStages.length * 1000);

    timeoutRefs.current.push(completeTimeoutId);
  };

  const cancelRepair = () => {
    clearTimers();
    startedAtRef.current = null;
    setProcessing(false);
    setProgress(0);
    setCurrentStage("");
  };

  const resetWorkflow = () => {
    clearTimers();
    startedAtRef.current = null;
    setSelectedFile(null);
    setUploadError("");
    setProcessing(false);
    setProgress(0);
    setCurrentStage("");
    setRepairComplete(false);
    setRepairTime("");
  };

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return (
    <PDFMedicContext.Provider
      value={{
        selectedFile,
        selectedRepairMode,
        advancedOptions,
        processing,
        progress,
        uploadError,
        currentStage,
        repairComplete,
        repairTime,
        setSelectedRepairMode,
        toggleAdvancedOption,
        selectFile,
        startRepair,
        cancelRepair,
        resetWorkflow,
      }}
    >
      {children}
    </PDFMedicContext.Provider>
  );
}

export function usePDFMedic() {
  const context = useContext(PDFMedicContext);

  if (!context) {
    throw new Error("usePDFMedic must be used within PDFMedicProvider.");
  }

  return context;
}
