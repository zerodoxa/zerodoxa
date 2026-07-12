import { NextRequest, NextResponse } from "next/server";
import { rotatePdf, cleanupTempDirectory } from "@/services/pdf/rotatePdfService";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const rotationsStr = formData.get("rotations") as string; // JSON string mapping page indexes to angles

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // MIME type validation & basic check
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only PDF is supported" },
        { status: 400 }
      );
    }

    if (!rotationsStr) {
      return NextResponse.json(
        { success: false, error: "No rotations mapping provided" },
        { status: 400 }
      );
    }

    let rotations: Record<number, number>;
    try {
      rotations = JSON.parse(rotationsStr);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid rotations format. Must be a JSON object" },
        { status: 400 }
      );
    }

    const uniqueId = crypto.randomUUID();
    const tempDir = path.join(tmpdir(), `pdfmedic-uploads-${uniqueId}`);
    await mkdir(tempDir, { recursive: true });
    // Secure input path (prevents path traversal)
    const inputPath = path.join(tempDir, `input-${uniqueId}.pdf`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(inputPath, buffer);

    try {
      const result = await rotatePdf({
        inputPath,
        rotations,
      });

      // Read the rotated PDF
      const rotatedBuffer = await readFile(result.outputPath);
      const originalName = file.name.replace(/\.pdf$/i, "");
      const rotatedFileName = `${originalName}-rotated.pdf`;

      // Cleanup temp files
      await cleanupTempDirectory(path.dirname(inputPath));
      await cleanupTempDirectory(path.dirname(result.outputPath));

      // Return the rotated PDF as a download
      return new NextResponse(rotatedBuffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${rotatedFileName}"`,
          "Content-Length": rotatedBuffer.length.toString(),
        },
      });
    } catch (serviceError) {
      // Cleanup on error
      await cleanupTempDirectory(tempDir);
      throw serviceError;
    }
  } catch (error) {
    console.error("Rotate PDF API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to rotate PDF",
      },
      { status: 500 }
    );
  }
}
