"use server";

import { writeFile, readFile } from "node:fs/promises";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "path";
import { PDFDocument, degrees } from "pdf-lib";

export interface RotatePdfServerOptions {
  inputPath: string;
  rotations: Record<number, number>; // Maps 0-indexed page numbers to rotation angles (0, 90, 180, 270)
}

export async function rotatePdf(options: RotatePdfServerOptions): Promise<{ outputPath: string }> {
  try {
    if (!options.inputPath) {
      throw new Error("Input path is required");
    }

    const tempDir = await createTempDirectory("rotatepdf");
    const uniqueId = crypto.randomUUID();
    const tempOutputPath = join(tempDir, `rotated-${uniqueId}.pdf`);

    const bytes = await readFile(options.inputPath);
    const pdf = await PDFDocument.load(bytes);

    const pages = pdf.getPages();
    for (const [pageIdxStr, angle] of Object.entries(options.rotations)) {
      const pageIdx = parseInt(pageIdxStr, 10);
      if (pageIdx >= 0 && pageIdx < pages.length) {
        const page = pages[pageIdx];
        const intrinsic = page.getRotation().angle;
        page.setRotation(degrees((intrinsic + angle) % 360));
      }
    }

    const savedBytes = await pdf.save({
      useObjectStreams: true,
    });

    await writeFile(tempOutputPath, Buffer.from(savedBytes));

    return { outputPath: tempOutputPath };
  } catch (error) {
    console.error("PDF server rotation error:", error);
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