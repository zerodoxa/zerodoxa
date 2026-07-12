"use server";

import { writeFile, readFile, readdir } from "node:fs/promises";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import JSZip from "jszip";

const execAsync = promisify(exec);

export interface PdfToImagesServerOptions {
  inputPath: string;
  format: "png" | "jpeg";
  dpi: number;
}

export async function pdfToImages(options: PdfToImagesServerOptions): Promise<{ outputPath: string }> {
  let tempDir = "";
  try {
    if (!options.inputPath) {
      throw new Error("Input path is required");
    }

    tempDir = await createTempDirectory("pdftoimages");
    const uniqueId = crypto.randomUUID();
    const tempOutputDir = join(tempDir, `output-${uniqueId}`);
    
    const { mkdir } = await import("node:fs/promises");
    await mkdir(tempOutputDir, { recursive: true });

    // Ensure pdftocairo exists
    try {
      await execAsync("command -v pdftoppm && command -v pdftocairo");
    } catch (_e) {
      console.warn("pdftocairo binary not found. Please install poppler-utils.");
      throw new Error("PDF processing tool (poppler-utils) is not installed on the server.");
    }

    const formatFlag = options.format === "png" ? "-png" : "-jpeg";
    const dpiFlag = `-r ${options.dpi || 150}`;
    const outputPrefix = join(tempOutputDir, "page");

    // Run pdftocairo: pdftocairo -png -r 150 input.pdf outputPrefix
    const command = `pdftocairo ${formatFlag} ${dpiFlag} "${options.inputPath}" "${outputPrefix}"`;
    
    await execAsync(command);

    // Read generated files
    const files = await readdir(tempOutputDir);
    const imageFiles = files.filter(f => f.endsWith(".png") || f.endsWith(".jpg"));

    if (imageFiles.length === 0) {
      throw new Error("Failed to generate images from PDF");
    }

    // Zip them
    const zip = new JSZip();
    for (const file of imageFiles) {
      const data = await readFile(join(tempOutputDir, file));
      zip.file(file, data);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 5 } });
    
    const zipOutputPath = join(tempDir, `images-${uniqueId}.zip`);
    await writeFile(zipOutputPath, zipBuffer);

    return { outputPath: zipOutputPath };
  } catch (error) {
    console.error("PDF server to images error:", error);
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
