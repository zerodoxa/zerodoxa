import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const mode = (formData.get("mode") as "all" | "range") || "all";
    const range = formData.get("range") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const totalPages = sourcePdf.getPageCount();

    let pageIndexes: number[] = [];

    if (mode === "all") {
      pageIndexes = sourcePdf.getPageIndices();
    } else {
      if (!range?.trim()) {
        return NextResponse.json(
          { success: false, error: "Please enter a page range." },
          { status: 400 }
        );
      }

      const parts = range.split(",");
      for (const part of parts) {
        const value = part.trim();
        if (value.includes("-")) {
          const [start, end] = value.split("-").map(Number);
          if (Number.isNaN(start) || Number.isNaN(end) || start > end) {
            continue;
          }
          for (let i = start; i <= end; i++) {
            pageIndexes.push(i - 1);
          }
        } else {
          const page = Number(value);
          if (!Number.isNaN(page)) {
            pageIndexes.push(page - 1);
          }
        }
      }
    }

    pageIndexes = [...new Set(pageIndexes)].filter(
      (page) => page >= 0 && page < totalPages
    );

    if (pageIndexes.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid pages found in the selected range." },
        { status: 400 }
      );
    }

    const baseName = file.name.replace(/\.pdf$/i, "");

    if (pageIndexes.length === 1) {
      // Return single PDF directly
      const pageIndex = pageIndexes[0];
      const pdf = await PDFDocument.create();
      const [copiedPage] = await pdf.copyPages(sourcePdf, [pageIndex]);
      pdf.addPage(copiedPage);
      const savedBytes = await pdf.save();

      return new NextResponse(Buffer.from(savedBytes) as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${baseName}-page-${pageIndex + 1}.pdf"`,
          "Content-Length": savedBytes.length.toString(),
        },
      });
    }

    // Create a zip file for multiple pages
    const zip = new JSZip();
    for (const pageIndex of pageIndexes) {
      const pdf = await PDFDocument.create();
      const [copiedPage] = await pdf.copyPages(sourcePdf, [pageIndex]);
      pdf.addPage(copiedPage);
      const savedBytes = await pdf.save();
      zip.file(`${baseName}-page-${pageIndex + 1}.pdf`, savedBytes);
    }

    const zipContent = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(zipContent as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${baseName}-split.zip"`,
        "Content-Length": zipContent.length.toString(),
      },
    });

  } catch (error) {
    console.error("Split PDF API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to split PDF",
      },
      { status: 500 }
    );
  }
}
