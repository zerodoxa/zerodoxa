"use server";

import { writeFile } from "node:fs/promises";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "path";

import { decrypt, encrypt } from "node-qpdf2";

export type EncryptionLevel = "aes-128" | "aes-256";

export interface ProtectPdfOptions {
  inputPath: string;
  outputPath: string;
  userPassword: string;
  ownerPassword?: string;
  encryptionLevel: EncryptionLevel;
  restrictions?: {
    print?: "full" | "low" | "none";
    modify?: "all" | "annotate" | "form" | "assembly" | "none";
    copy?: "y" | "n";
    annotate?: "y" | "n";
    fillForm?: "y" | "n";
    extract?: "y" | "n";
    assemble?: "y" | "n";
    printHighResolution?: "y" | "n";
  };
}

export interface UnlockPdfOptions {
  inputPath: string;
  outputPath: string;
  password: string;
}

export async function protectPdf(options: ProtectPdfOptions): Promise<{ outputPath: string }> {
  try {
    // Validate inputs
    if (!options.inputPath) throw new Error("Input path is required");
    if (!options.userPassword) throw new Error("User password is required");
    if (options.userPassword.length < 8) throw new Error("User password must be at least 8 characters");

    const tempDir = await createTempDirectory("protectpdf");
    const uniqueId = crypto.randomUUID();
    const tempInputPath = options.inputPath;
    const tempOutputPath = join(tempDir, `protected-${uniqueId}.pdf`);

    let restrictions: Record<string, string> | undefined = undefined;
    if (options.restrictions) {
      const r = options.restrictions;
      const cleanRestrictions: Record<string, string> = {};
      
      if (r.print === "full" || r.print === "low" || r.print === "none") {
        cleanRestrictions.print = r.print;
      }
      if (r.modify === "all" || r.modify === "annotate" || r.modify === "form" || r.modify === "assembly" || r.modify === "none") {
        cleanRestrictions.modify = r.modify;
      }
      if (r.copy === "y" || r.copy === "n") {
        cleanRestrictions.accessibility = r.copy;
      }
      if (r.annotate === "y" || r.annotate === "n") {
        cleanRestrictions.annotate = r.annotate;
      }
      if (r.assemble === "y" || r.assemble === "n") {
        cleanRestrictions.assemble = r.assemble;
      }
      if (r.fillForm === "y" || r.fillForm === "n") {
        cleanRestrictions.form = r.fillForm;
      }
      if (r.extract === "y" || r.extract === "n") {
        cleanRestrictions.extract = r.extract;
      }

      if (Object.keys(cleanRestrictions).length > 0) {
        restrictions = cleanRestrictions;
      }
    }

    // Prepare encryption options for node-qpdf2
    const encryptOptions = {
      input: tempInputPath,
      output: tempOutputPath,
      keyLength: (options.encryptionLevel === "aes-256" ? 256 : 128) as 256 | 128,
      overwrite: true,
      password: {
        user: options.userPassword,
        owner: options.ownerPassword || options.userPassword,
      },
      restrictions,
    };

    console.log("Encrypting PDF with options:", {
      ...encryptOptions,
      password: "****",
      input: "[file]",
      output: "[output]",
    });

    // Perform encryption
    await encrypt(encryptOptions);

    // Return the output path
    return { outputPath: tempOutputPath };
  } catch (error) {
    console.error("PDF protection error:", error);
    throw error;
  }
}

export async function unlockPdf(options: UnlockPdfOptions): Promise<{ outputPath: string }> {
  try {
    // Validate inputs
    if (!options.inputPath) throw new Error("Input path is required");
    if (!options.password) throw new Error("Password is required");

    const tempDir = await createTempDirectory("unlockpdf");
    const uniqueId = crypto.randomUUID();
    const tempInputPath = options.inputPath;
    const tempOutputPath = join(tempDir, `unlocked-${uniqueId}.pdf`);

    // Prepare decryption options for node-qpdf2
    const decryptOptions = {
      input: tempInputPath,
      output: tempOutputPath,
      password: options.password,
    };

    console.log("Decrypting PDF with input:", tempInputPath);

    // Perform decryption
    await decrypt(decryptOptions);

    // Return the output path
    return { outputPath: tempOutputPath };
  } catch (error) {
    console.error("PDF unlock error:", error);
    const message = getErrorMessage(error);
    throw new Error(`Failed to unlock PDF: ${message}`);
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") {
    if (error.includes("invalid password")) {
      return "Invalid password";
    }
    return error;
  }
  if (error && typeof error === "object") {
    const errorObj = error as Record<string, unknown>;
    const msg = (typeof errorObj.message === "string" ? errorObj.message : "") ||
                (typeof errorObj.stderr === "string" ? errorObj.stderr : "");
    if (msg) {
      if (msg.includes("invalid password")) {
        return "Invalid password";
      }
      return msg;
    }
  }
  return "Unknown error";
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