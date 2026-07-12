import { NextRequest, NextResponse } from "next/server";
import { compressPdf, cleanupTempDirectory } from "@/services/pdf/compressPdfService";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const compressionLevel = (formData.get("compressionLevel") as "low" | "medium" | "high") || "medium";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // MIME type verification & basic check
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only PDF is supported" },
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
      const result = await compressPdf({
        inputPath,
        level: compressionLevel,
      });

      // Read the compressed PDF
      const compressedBuffer = await readFile(result.outputPath);
      const originalName = file.name.replace(/\.pdf$/i, "");
      const compressedFileName = `${originalName}-compressed.pdf`;

      const originalSize = file.size;
      const compressedSize = compressedBuffer.length;
      const rawSavings = originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0;
      const savings = Math.max(0, Number(rawSavings.toFixed(1)));

      // Cleanup temp files
      await cleanupTempDirectory(path.dirname(inputPath));
      await cleanupTempDirectory(path.dirname(result.outputPath));

      // Return the compressed PDF as a download with custom headers for compression stats
      return new NextResponse(compressedBuffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${compressedFileName}"`,
          "Content-Length": compressedBuffer.length.toString(),
          "X-Original-Size": originalSize.toString(),
          "X-Compressed-Size": compressedSize.toString(),
          "X-Savings": savings.toString(),
        },
      });
    } catch (serviceError) {
      // Cleanup on error
      await cleanupTempDirectory(tempDir);
      throw serviceError;
    }
  } catch (error) {
    console.error("Compress PDF API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to compress PDF",
      },
      { status: 500 }
    );
  }
}
