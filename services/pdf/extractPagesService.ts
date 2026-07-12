"use server";

import { writeFile, readFile } from "node:fs/promises";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "path";
import { PDFDocument } from "pdf-lib";
import { parsePages } from "@/lib/pdf/validation";

export interface ExtractPagesServerOptions {
  inputPath: string;
  pages: string;
}

export async function extractPages(options: ExtractPagesServerOptions): Promise<{ outputPath: string; extractedPages: number[] }> {
  try {
    if (!options.inputPath) {
      throw new Error("Input path is required");
    }

    const tempDir = await createTempDirectory("extractpages");
    const uniqueId = crypto.randomUUID();
    const tempOutputPath = join(tempDir, `extracted-${uniqueId}.pdf`);

    const bytes = await readFile(options.inputPath);
    const sourcePdf = await PDFDocument.load(bytes);
    const totalPages = sourcePdf.getPageCount();

    const { pagesToDelete: pagesToExtract, errors } = parsePages(options.pages, totalPages);

    if (errors.length > 0) {
      throw new Error(errors.join(" "));
    }

    if (pagesToExtract.size === 0) {
      throw new Error("No pages specified to extract.");
    }

    const newPdf = await PDFDocument.create();

    // Sort page numbers to ensure correct document order
    const pagesToCopy = Array.from(pagesToExtract).sort((a, b) => a - b).map(p => p - 1);

    const copiedPages = await newPdf.copyPages(sourcePdf, pagesToCopy);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const savedBytes = await newPdf.save({
      useObjectStreams: true,
    });

    await writeFile(tempOutputPath, Buffer.from(savedBytes));

    return {
      outputPath: tempOutputPath,
      extractedPages: Array.from(pagesToExtract).sort((a, b) => a - b),
    };
  } catch (error) {
    console.error("PDF server extraction error:", error);
    throw error;
  }
}

async function createTempDirectory(prefix: string): Promise<string> {
  const tempDir = join(tmpdir(), prefix + "-" + crypto.randomUUID().split("-")[0]);
  const { mkdir } = await import("node:fs/promises");
  await mkdir(tempDir, { recursive: true });
  await writeFile(join(tempDir, ".keep"), "");
  return tempDir;
}

export async function cleanupTempDirectory(tempPath: string): Promise<void> {
  try {
    const { rm } = await import("node:fs/promises");
    await rm(tempPath, { recursive: true, force: true });
  } catch (error) {
    console.warn("Failed to clean up temp directory:", tempPath, error);
  }
}