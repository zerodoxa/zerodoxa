"use server";

import { writeFile, readFile } from "node:fs/promises";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "path";
import { PDFDocument, degrees } from "pdf-lib";

export interface OrganizePdfPage {
  originalIndex: number; // 0-indexed original page index
  rotation: number;      // 0, 90, 180, 270 (visual rotation angle to apply)
}

export interface OrganizePdfServerOptions {
  inputPath: string;
  pages: OrganizePdfPage[]; // Desired page sequence with rotations
}

export async function organizePdf(options: OrganizePdfServerOptions): Promise<{ outputPath: string }> {
  let tempDir = "";
  try {
    if (!options.inputPath) {
      throw new Error("Input path is required");
    }
    if (!options.pages || options.pages.length === 0) {
      throw new Error("At least one page is required for organized output");
    }

    tempDir = await createTempDirectory("organizepdf");
    const uniqueId = crypto.randomUUID();
    const tempOutputPath = join(tempDir, `organized-${uniqueId}.pdf`);

    const bytes = await readFile(options.inputPath);
    const srcDoc = await PDFDocument.load(bytes);
    const destDoc = await PDFDocument.create();

    const originalPages = srcDoc.getPages();
    const pageCount = originalPages.length;

    // Validate page indices
    for (const pageConfig of options.pages) {
      if (pageConfig.originalIndex < 0 || pageConfig.originalIndex >= pageCount) {
        throw new Error(`Invalid page index ${pageConfig.originalIndex}. Source PDF has ${pageCount} pages.`);
      }
    }

    // Extract pages to copy
    const indicesToCopy = options.pages.map((p) => p.originalIndex);
    const copiedPages = await destDoc.copyPages(srcDoc, indicesToCopy);

    // Add copied pages and apply rotation
    for (let i = 0; i < copiedPages.length; i++) {
      const pageConfig = options.pages[i];
      const copiedPage = copiedPages[i];
      const intrinsic = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((intrinsic + pageConfig.rotation) % 360));
      destDoc.addPage(copiedPage);
    }

    const savedBytes = await destDoc.save({
      useObjectStreams: true,
    });

    await writeFile(tempOutputPath, Buffer.from(savedBytes));

    return { outputPath: tempOutputPath };
  } catch (error) {
    console.error("PDF server organize error:", error);
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
