"use server";

import { writeFile, readFile } from "node:fs/promises";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "path";
import { spawn } from "node:child_process";
import { PDFDocument } from "pdf-lib";

export type CompressionLevel = "low" | "medium" | "high";

export interface CompressPdfOptions {
  inputPath: string;
  level: CompressionLevel;
}

export async function compressPdf(options: CompressPdfOptions): Promise<{ outputPath: string }> {
  const tempDir = await createTempDirectory("compresspdf");
  const uniqueId = crypto.randomUUID();
  const tempOutputPath = join(tempDir, `compressed-${uniqueId}.pdf`);

  try {
    if (!options.inputPath) {
      throw new Error("Input path is required");
    }

    // Determine qpdf arguments based on level
    // Low: --compression-level=1 --object-streams=generate
    // Medium: --compression-level=6 --recompress-flate --object-streams=generate
    // High: --compression-level=9 --recompress-flate --object-streams=generate
    const args = [
      "--compress-streams=y",
      `--compression-level=${options.level === "low" ? "1" : options.level === "high" ? "9" : "6"}`,
    ];

    if (options.level === "medium" || options.level === "high") {
      args.push("--recompress-flate");
    }

    args.push("--object-streams=generate");
    args.push(options.inputPath);
    args.push(tempOutputPath);

    console.log("Compressing PDF with qpdf args:", args);

    await runQpdf(args);

    return { outputPath: tempOutputPath };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      console.warn("qpdf binary not found, falling back to pdf-lib compression...");
      try {
        await compressFallback(options.inputPath, tempOutputPath);
        return { outputPath: tempOutputPath };
      } catch (fallbackError) {
        console.error("Fallback compression failed:", fallbackError);
        throw fallbackError;
      }
    }
    console.error("PDF compression error:", error);
    throw error;
  }
}

async function compressFallback(inputPath: string, outputPath: string): Promise<void> {
  const bytes = await readFile(inputPath);
  const pdf = await PDFDocument.load(bytes);
  
  const compressedBytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });
  
  await writeFile(outputPath, Buffer.from(compressedBytes));
}

function runQpdf(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn("qpdf", args);
    const stderr: string[] = [];

    process.stderr.on("data", (data) => {
      stderr.push(data.toString());
    });

    process.on("error", (error) => {
      reject(error);
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr.join("") || `qpdf exited with code ${code}`));
      }
    });
  });
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
