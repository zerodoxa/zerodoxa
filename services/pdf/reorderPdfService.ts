"use server";

import { writeFile, readFile } from "node:fs/promises";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "path";
import { PDFDocument } from "pdf-lib";

export interface ReorderPdfServerOptions {
  inputPath: string;
  pages: number[]; // Array of original page indices (0-indexed) in the desired order
}

export async function reorderPdf(options: ReorderPdfServerOptions): Promise<{ outputPath: string }> {
  let tempDir = "";
  try {
    if (!options.inputPath) {
      throw new Error("Input path is required");
    }
    if (!options.pages || options.pages.length === 0) {
      throw new Error("At least one page is required for reordered output");
    }

    tempDir = await createTempDirectory("reorderpdf");
    const uniqueId = crypto.randomUUID();
    const tempOutputPath = join(tempDir, `reordered-${uniqueId}.pdf`);

    const bytes = await readFile(options.inputPath);
    const srcDoc = await PDFDocument.load(bytes);
    const destDoc = await PDFDocument.create();

    const originalPages = srcDoc.getPages();
    const pageCount = originalPages.length;

    // Validate page indices
    for (const pageIndex of options.pages) {
      if (pageIndex < 0 || pageIndex >= pageCount) {
        throw new Error(`Invalid page index ${pageIndex}. Source PDF has ${pageCount} pages.`);
      }
    }

    // Copy and add pages in the specified order
    const copiedPages = await destDoc.copyPages(srcDoc, options.pages);
    for (const copiedPage of copiedPages) {
      destDoc.addPage(copiedPage);
    }

    const savedBytes = await destDoc.save({
      useObjectStreams: true,
    });

    await writeFile(tempOutputPath, Buffer.from(savedBytes));

    return { outputPath: tempOutputPath };
  } catch (error) {
    console.error("PDF server reorder error:", error);
    if (tempDir) {
      await cleanupTempDirectory(tempDir);
    }
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
