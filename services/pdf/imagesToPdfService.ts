"use server";

import { writeFile, mkdir } from "node:fs/promises";
import * as crypto from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PDFDocument } from "pdf-lib";

export type PageSize = "A4" | "Letter";
export type Orientation = "portrait" | "landscape";
export type MarginSize = "none" | "small" | "medium" | "large";

export interface ImagesToPdfServiceOptions {
  pageSize: PageSize;
  orientation: Orientation;
  margin: MarginSize;
}

// Page dimensions in points (1 pt = 1/72 inch)
const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612, height: 792 },
};

const MARGINS = {
  none: 0,
  small: 18,   // 0.25 inch
  medium: 36,  // 0.5 inch
  large: 72,   // 1 inch
};

export async function imagesToPdf(
  imageBuffers: { buffer: Buffer; mimeType: string; name: string }[],
  options: ImagesToPdfServiceOptions
): Promise<{ outputPath: string; pageCount: number }> {
  const uniqueId = crypto.randomUUID();
  const tempDir = join(tmpdir(), `imagestopdf-${uniqueId}`);
  await mkdir(tempDir, { recursive: true });

  const outputPath = join(tempDir, `converted-${uniqueId}.pdf`);

  try {
    const pdfDoc = await PDFDocument.create();

    const { width: baseWidth, height: baseHeight } = PAGE_SIZES[options.pageSize];
    const margin = MARGINS[options.margin];

    for (const img of imageBuffers) {
      let imageBuffer = img.buffer;
      let mimeType = img.mimeType;

      // Convert WebP to PNG using sharp
      if (mimeType === "image/webp") {
        const sharp = (await import("sharp")).default;
        imageBuffer = await sharp(imageBuffer).png().toBuffer();
        mimeType = "image/png";
      }

      let embeddedImage;
      if (mimeType === "image/png") {
        embeddedImage = await pdfDoc.embedPng(imageBuffer);
      } else {
        // JPEG / JPG
        embeddedImage = await pdfDoc.embedJpg(imageBuffer);
      }

      // Determine page dimensions based on orientation
      let pageWidth = baseWidth;
      let pageHeight = baseHeight;
      if (options.orientation === "landscape") {
        pageWidth = baseHeight;
        pageHeight = baseWidth;
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      // Available drawing area
      const drawWidth = pageWidth - margin * 2;
      const drawHeight = pageHeight - margin * 2;

      // Scale image to fit within drawing area while preserving aspect ratio
      const imgAspect = embeddedImage.width / embeddedImage.height;
      const areaAspect = drawWidth / drawHeight;

      let finalWidth: number;
      let finalHeight: number;

      if (imgAspect > areaAspect) {
        finalWidth = drawWidth;
        finalHeight = drawWidth / imgAspect;
      } else {
        finalHeight = drawHeight;
        finalWidth = drawHeight * imgAspect;
      }

      // Center the image on the page
      const x = margin + (drawWidth - finalWidth) / 2;
      const y = margin + (drawHeight - finalHeight) / 2;

      page.drawImage(embeddedImage, {
        x,
        y,
        width: finalWidth,
        height: finalHeight,
      });
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    await writeFile(outputPath, Buffer.from(pdfBytes));

    return { outputPath, pageCount: pdfDoc.getPageCount() };
  } catch (error) {
    await cleanupTempDirectory(tempDir).catch(() => null);
    throw error;
  }
}

export async function cleanupTempDirectory(dirPath: string): Promise<void> {
  try {
    const { rm } = await import("node:fs/promises");
    await rm(dirPath, { recursive: true, force: true });
  } catch {
    // Silently ignore cleanup errors
  }
}
