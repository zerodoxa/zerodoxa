import { NextRequest, NextResponse } from "next/server";
import { extractPages, cleanupTempDirectory } from "@/services/pdf/extractPagesService";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const pages = formData.get("pages") as string;

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

    if (!pages || !pages.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter page numbers to extract" },
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
      const result = await extractPages({
        inputPath,
        pages,
      });

      // Read the extracted PDF
      const extractedBuffer = await readFile(result.outputPath);
      const originalName = file.name.replace(/\.pdf$/i, "");
      const extractedFileName = `${originalName}-extracted.pdf`;

      // Cleanup temp files
      await cleanupTempDirectory(path.dirname(inputPath));
      await cleanupTempDirectory(path.dirname(result.outputPath));

      // Return the extracted PDF as a download
      return new NextResponse(extractedBuffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${extractedFileName}"`,
          "Content-Length": extractedBuffer.length.toString(),
          "X-Extracted-Pages": JSON.stringify(result.extractedPages),
        },
      });
    } catch (serviceError) {
      // Cleanup on error
      await cleanupTempDirectory(tempDir);
      throw serviceError;
    }
  } catch (error) {
    console.error("Extract Pages API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to extract pages",
      },
      { status: 500 }
    );
  }
}
