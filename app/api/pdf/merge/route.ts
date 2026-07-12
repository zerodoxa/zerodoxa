import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const altFiles = formData.getAll("file") as File[];
    const allFiles = [...files, ...altFiles];

    if (allFiles.length < 2) {
      return NextResponse.json(
        { success: false, error: "At least two PDF files are required to merge." },
        { status: 400 }
      );
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of allFiles) {
      if (!file || file.size === 0) continue;
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(
        sourcePdf,
        sourcePdf.getPageIndices()
      );
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    
    return new NextResponse(Buffer.from(mergedBytes) as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="merged-pdfs.pdf"`,
        "Content-Length": mergedBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("Merge PDF API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to merge PDFs",
      },
      { status: 500 }
    );
  }
}
