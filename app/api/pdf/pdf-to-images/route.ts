import { NextRequest, NextResponse } from "next/server";
import { pdfToImages, cleanupTempDirectory } from "@/services/pdf/pdfToImagesService";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const format = (formData.get("format") as string) || "jpeg";
    const dpi = parseInt((formData.get("dpi") as string) || "150", 10);

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

    if (format !== "png" && format !== "jpeg") {
      return NextResponse.json(
        { success: false, error: "Invalid format. Must be png or jpeg" },
        { status: 400 }
      );
    }

    if (isNaN(dpi) || dpi < 72 || dpi > 600) {
      return NextResponse.json(
        { success: false, error: "Invalid DPI. Must be between 72 and 600" },
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
      const result = await pdfToImages({
        inputPath,
        format: format as "png" | "jpeg",
        dpi,
      });

      const zipBuffer = await readFile(result.outputPath);
      const originalName = file.name.replace(/\.pdf$/i, "");
      const zipFileName = `${originalName}-images.zip`;

      await cleanupTempDirectory(path.dirname(inputPath));
      await cleanupTempDirectory(path.dirname(result.outputPath));

      return new NextResponse(zipBuffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${zipFileName}"`,
          "Content-Length": zipBuffer.length.toString(),
        },
      });
    } catch (serviceError) {
      await cleanupTempDirectory(tempDir);
      throw serviceError;
    }
  } catch (error) {
    console.error("PDF to Images API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to convert PDF to images",
      },
      { status: 500 }
    );
  }
}
