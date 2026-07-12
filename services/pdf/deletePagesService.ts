"use server";

import { writeFile, readFile } from "node:fs/promises";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "path";
import { PDFDocument } from "pdf-lib";

import { parsePages } from "@/lib/pdf/validation";

export interface DeletePagesServerOptions {
  inputPath: string;
  pages: string;
}

export async function deletePages(options: DeletePagesServerOptions): Promise<{ outputPath: string; deletedPages: number[] }> {
  if (!options.inputPath) {
    throw new Error("Input path is required");
  }

  const tempDir = await createTempDirectory("deletepages");
  const uniqueId = crypto.randomUUID();
  const tempOutputPath = join(tempDir, `deleted-${uniqueId}.pdf`);

  try {
    const bytes = await readFile(options.inputPath);
    const sourcePdf = await PDFDocument.load(bytes);
    const totalPages = sourcePdf.getPageCount();

    const { pagesToDelete, errors } = parsePages(options.pages, totalPages);

    if (errors.length > 0) {
      throw new Error(errors.join(" "));
    }

    if (pagesToDelete.size === 0) {
      throw new Error("No pages specified to delete.");
    }

    if (pagesToDelete.size === totalPages) {
      throw new Error("Cannot delete all pages of the PDF. At least 1 page must remain.");
    }

    const newPdf = await PDFDocument.create();
    const keepPages: number[] = [];

    // pagesToDelete contains 1-based page numbers.
    // Copy 0-indexed pages that are NOT in pagesToDelete.
    for (let i = 0; i < totalPages; i++) {
      if (!pagesToDelete.has(i + 1)) {
        keepPages.push(i);
      }
    }

    const copiedPages = await newPdf.copyPages(sourcePdf, keepPages);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const savedBytes = await newPdf.save({
      useObjectStreams: true,
    });

    await writeFile(tempOutputPath, Buffer.from(savedBytes));

    return {
      outputPath: tempOutputPath,
      deletedPages: Array.from(pagesToDelete).sort((a, b) => a - b),
    };
  } catch (error) {
    console.error("PDF server deletion error:", error);
    await cleanupTempDirectory(tempDir).catch(() => null);
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