import { NextRequest, NextResponse } from "next/server";
import { readFile, mkdir } from "node:fs/promises";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { imagesToPdf, cleanupTempDirectory } from "@/services/pdf/imagesToPdfService";
import type { PageSize, Orientation, MarginSize } from "@/services/pdf/imagesToPdfService";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export async function POST(request: NextRequest) {
  const uniqueId = crypto.randomUUID();
  const tempDir = path.join(tmpdir(), `pdfmedic-uploads-${uniqueId}`);

  try {
    const formData = await request.formData();

    // Collect all image files
    const imageFiles = formData.getAll("images") as File[];

    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: "No images provided" },
        { status: 400 }
      );
    }

    if (imageFiles.length > 50) {
      return NextResponse.json(
        { success: false, error: "Maximum 50 images allowed" },
        { status: 400 }
      );
    }

    // Validate all images
    for (const img of imageFiles) {
      if (!ALLOWED_TYPES.has(img.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported file type: ${img.type}. Allowed: JPG, PNG, WebP`,
          },
          { status: 400 }
        );
      }
    }

    // Options from form
    const pageSize = (formData.get("pageSize") as PageSize) || "A4";
    const orientation = (formData.get("orientation") as Orientation) || "portrait";
    const margin = (formData.get("margin") as MarginSize) || "medium";

    await mkdir(tempDir, { recursive: true });

    // Read image buffers
    const imageBuffers = await Promise.all(
      imageFiles.map(async (img) => {
        const arrayBuffer = await img.arrayBuffer();
        return {
          buffer: Buffer.from(arrayBuffer),
          mimeType: img.type,
          name: img.name,
        };
      })
    );

    try {
      const result = await imagesToPdf(imageBuffers, {
        pageSize,
        orientation,
        margin,
      });

      const pdfBuffer = await readFile(result.outputPath);

      // Cleanup output temp dir
      await cleanupTempDirectory(path.dirname(result.outputPath));

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="images-to-pdf.pdf"',
          "Content-Length": pdfBuffer.length.toString(),
        },
      });
    } catch (serviceError) {
      throw serviceError;
    }
  } catch (error) {
    console.error("Images to PDF API error:", error);
    // Cleanup upload temp dir on error
    await cleanupTempDirectory(tempDir).catch(() => null);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to convert images to PDF",
      },
      { status: 500 }
    );
  } finally {
    await cleanupTempDirectory(tempDir).catch(() => null);
  }
}
