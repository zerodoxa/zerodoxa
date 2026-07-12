import { NextRequest, NextResponse } from "next/server";
import { organizePdf, cleanupTempDirectory, OrganizePdfPage } from "@/services/pdf/organizePdfService";
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
        { success: false, error: "Page configuration is required" },
        { status: 400 }
      );
    }

    let pages: OrganizePdfPage[] = [];
    try {
      pages = JSON.parse(pagesStr);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid page configuration format" },
        { status: 400 }
      );
    }

    if (pages.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one page is required for organized output" },
        { status: 400 }
      );
    }

    const uniqueId = crypto.randomUUID();
    const tempDir = path.join(tmpdir(), `pdfmedic-uploads-${uniqueId}`);
    await mkdir(tempDir, { recursive: true });
    const inputPath = path.join(tempDir, `input-${uniqueId}.pdf`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(inputPath, buffer);

    try {
      const result = await organizePdf({
        inputPath,
        pages,
      });

      const pdfBuffer = await readFile(result.outputPath);
      const originalName = file.name.replace(/\.pdf$/i, "");
      const organizedFileName = `${originalName}-organized.pdf`;

      // Cleanup input and output temp directories
      await cleanupTempDirectory(path.dirname(inputPath));
      await cleanupTempDirectory(path.dirname(result.outputPath));

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${organizedFileName}"`,
          "Content-Length": pdfBuffer.length.toString(),
        },
      });
    } catch (serviceError) {
      await cleanupTempDirectory(tempDir);
      throw serviceError;
    }
  } catch (error) {
    console.error("Organize Pages API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to organize PDF pages",
      },
      { status: 500 }
    );
  }
}
