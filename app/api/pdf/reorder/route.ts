import { NextRequest, NextResponse } from "next/server";
import { reorderPdf, cleanupTempDirectory } from "@/services/pdf/reorderPdfService";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const pagesStr = formData.get("pages") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only PDF is supported" },
        { status: 400 }
      );
    }

    if (!pagesStr || !pagesStr.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide the new page order" },
        { status: 400 }
      );
    }

    let pages: number[];
    try {
      pages = JSON.parse(pagesStr);
      if (!Array.isArray(pages)) {
        throw new Error("Pages must be an array of numbers");
      }
    } catch (_e) {
      return NextResponse.json(
        { success: false, error: "Invalid pages format" },
        { status: 400 }
      );
    }

    const uniqueId = crypto.randomUUID();
    const tempDir = path.join(tmpdir(), `pdfmedic-reorder-${uniqueId}`);
    await mkdir(tempDir, { recursive: true });
    
    const inputPath = path.join(tempDir, `input-${uniqueId}.pdf`);
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(inputPath, Buffer.from(arrayBuffer));

    try {
      const result = await reorderPdf({
        inputPath,
        pages,
      });

      const reorderedBuffer = await readFile(result.outputPath);
      const originalName = file.name.replace(/\.pdf$/i, "");
      const reorderedFileName = `${originalName}-reordered.pdf`;

      await cleanupTempDirectory(path.dirname(inputPath));
      await cleanupTempDirectory(path.dirname(result.outputPath));

      return new NextResponse(reorderedBuffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${reorderedFileName}"`,
          "Content-Length": reorderedBuffer.length.toString(),
        },
      });
    } catch (serviceError) {
      await cleanupTempDirectory(tempDir);
      throw serviceError;
    }
  } catch (error) {
    console.error("Reorder Pages API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reorder pages",
      },
      { status: 500 }
    );
  }
}
