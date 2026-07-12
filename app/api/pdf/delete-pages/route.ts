import { NextRequest, NextResponse } from "next/server";
import { deletePages, cleanupTempDirectory } from "@/services/pdf/deletePagesService";
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
        { success: false, error: "Please enter page numbers to delete" },
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
      const result = await deletePages({
        inputPath,
        pages,
      });

      // Read the cleaned PDF
      const deletedBuffer = await readFile(result.outputPath);
      const originalName = file.name.replace(/\.pdf$/i, "");
      const cleanedFileName = `${originalName}-pages-deleted.pdf`;

      // Cleanup temp files
      await cleanupTempDirectory(path.dirname(inputPath));
      await cleanupTempDirectory(path.dirname(result.outputPath));

      // Return the cleaned PDF as a download
      return new NextResponse(deletedBuffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${cleanedFileName}"`,
          "Content-Length": deletedBuffer.length.toString(),
          "X-Deleted-Pages": JSON.stringify(result.deletedPages),
        },
      });
    } catch (serviceError) {
      // Cleanup on error
      await cleanupTempDirectory(tempDir);
      throw serviceError;
    }
  } catch (error) {
    console.error("Delete Pages API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete pages",
      },
      { status: 500 }
    );
  }
}
