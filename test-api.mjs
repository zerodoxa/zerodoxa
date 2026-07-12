import { PDFDocument } from 'pdf-lib';
import { writeFileSync } from 'fs';
import JSZip from 'jszip';
import { execSync } from 'child_process';

let hasQpdf = false;
try {
  execSync('qpdf --version', { stdio: 'ignore' });
  hasQpdf = true;
} catch (_e) {
  console.warn("WARNING: qpdf binary not found in PATH. Protect/Unlock tests will be skipped.");
}

let hasPdftocairo = true;
try {
  execSync('command -v pdftocairo', { stdio: 'ignore' });
} catch (_e) {
  console.warn("WARNING: pdftocairo binary not found in PATH, but we will test it anyway.");
}

async function createTestPDF(text, width = 500, height = 500) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([width, height]);
  page.drawText(text, { x: 50, y: height - 100, size: 24 });
  return await pdfDoc.save();
}

async function runTests() {
  try {
    console.log("Creating test PDFs...");
    const pdf1Bytes = await createTestPDF("Page 1 of Test PDF");
    const pdf2Bytes = await createTestPDF("Page 2 of Test PDF");

    const file1 = new File([new Blob([pdf1Bytes])], 'test-file-1.pdf', { type: 'application/pdf' });
    const file2 = new File([new Blob([pdf2Bytes])], 'test-file-2.pdf', { type: 'application/pdf' });

    console.log("----------------------------------------");
    console.log("1. Testing Merge PDF API...");
    const mergeFormData = new FormData();
    mergeFormData.append('files', file1);
    mergeFormData.append('files', file2);

    const mergeRes = await fetch('http://localhost:3000/api/pdf/merge', {
      method: 'POST',
      body: mergeFormData,
    });

    if (!mergeRes.ok) {
      const err = await mergeRes.text();
      throw new Error("Merge API failed: " + err);
    }

    const mergedBytes = await mergeRes.arrayBuffer();
    const mergedDoc = await PDFDocument.load(mergedBytes);
    const mergedPageCount = mergedDoc.getPageCount();
    console.log(`SUCCESS: Merged PDF page count: ${mergedPageCount}`);
    if (mergedPageCount !== 2) {
      throw new Error(`Expected 2 pages in merged PDF, but got ${mergedPageCount}`);
    }
    writeFileSync('test-merged.pdf', Buffer.from(mergedBytes));
    console.log("Saved merged PDF to test-merged.pdf");

    console.log("----------------------------------------");
    console.log("2. Testing Split PDF API (Split All pages -> ZIP)...");
    const splitAllFormData = new FormData();
    const mergedFile = new File([mergedBytes], 'test-merged.pdf', { type: 'application/pdf' });
    splitAllFormData.append('file', mergedFile);
    splitAllFormData.append('mode', 'all');

    const splitAllRes = await fetch('http://localhost:3000/api/pdf/split', {
      method: 'POST',
      body: splitAllFormData,
    });

    if (!splitAllRes.ok) {
      const err = await splitAllRes.text();
      throw new Error("Split All API failed: " + err);
    }

    const splitAllBytes = await splitAllRes.arrayBuffer();
    const zip = await JSZip.loadAsync(splitAllBytes);
    const zipFiles = Object.keys(zip.files);
    console.log("SUCCESS: Split All returned a zip file containing:", zipFiles);
    if (zipFiles.length !== 2) {
      throw new Error(`Expected 2 files in zip, but got ${zipFiles.length}`);
    }

    console.log("----------------------------------------");
    console.log("3. Testing Split PDF API (Split Custom Range -> Single PDF)...");
    const splitRangeFormData = new FormData();
    splitRangeFormData.append('file', mergedFile);
    splitRangeFormData.append('mode', 'range');
    splitRangeFormData.append('range', '1');

    const splitRangeRes = await fetch('http://localhost:3000/api/pdf/split', {
      method: 'POST',
      body: splitRangeFormData,
    });

    if (!splitRangeRes.ok) {
      const err = await splitRangeRes.text();
      throw new Error("Split Range API failed: " + err);
    }

    const splitRangeBytes = await splitRangeRes.arrayBuffer();
    const splitRangeDoc = await PDFDocument.load(splitRangeBytes);
    const splitRangePageCount = splitRangeDoc.getPageCount();
    console.log(`SUCCESS: Split Range page count: ${splitRangePageCount}`);
    if (splitRangePageCount !== 1) {
      throw new Error(`Expected 1 page in extracted PDF, but got ${splitRangePageCount}`);
    }

    let protectedBytes;
    if (hasQpdf) {
      console.log("----------------------------------------");
      console.log("4. Testing Protect PDF API...");
      const protectFormData = new FormData();
      protectFormData.append('file', file1);
      protectFormData.append('userPassword', 'secretpassword123');
      protectFormData.append('encryptionLevel', 'aes-256');

      const protectRes = await fetch('http://localhost:3000/api/pdf/protect', {
        method: 'POST',
        body: protectFormData,
      });

      if (!protectRes.ok) {
        const err = await protectRes.text();
        throw new Error("Protect API failed: " + err);
      }

      protectedBytes = await protectRes.arrayBuffer();
      writeFileSync('test-protected.pdf', Buffer.from(protectedBytes));
      console.log("SUCCESS: Protected PDF created at test-protected.pdf");

      console.log("----------------------------------------");
      console.log("5. Testing Unlock PDF API with WRONG password...");
      const wrongUnlockFormData = new FormData();
      const protectedFile = new File([protectedBytes], 'test-protected.pdf', { type: 'application/pdf' });
      wrongUnlockFormData.append('file', protectedFile);
      wrongUnlockFormData.append('password', 'wrongpassword');

      const wrongUnlockRes = await fetch('http://localhost:3000/api/pdf/unlock', {
        method: 'POST',
        body: wrongUnlockFormData,
      });

      if (wrongUnlockRes.ok) {
        throw new Error("FAILED: Should have thrown an error for wrong password.");
      } else {
        const errResponse = await wrongUnlockRes.json();
        console.log("SUCCESS: Caught expected error for wrong password. Status:", wrongUnlockRes.status, "Error:", errResponse.error);
      }

      console.log("----------------------------------------");
      console.log("6. Testing Unlock PDF API with CORRECT password...");
      const unlockFormData = new FormData();
      unlockFormData.append('file', protectedFile);
      unlockFormData.append('password', 'secretpassword123');

      const unlockRes = await fetch('http://localhost:3000/api/pdf/unlock', {
        method: 'POST',
        body: unlockFormData,
      });

      if (!unlockRes.ok) {
        const err = await unlockRes.text();
        throw new Error("Unlock API failed: " + err);
      }

      const unlockedBytes = await unlockRes.arrayBuffer();
      writeFileSync('test-unlocked.pdf', Buffer.from(unlockedBytes));
      
      // verify unlocked pdf is readable
      const verifyDoc = await PDFDocument.load(unlockedBytes);
      console.log("SUCCESS: Unlocked PDF loaded correctly. Page count:", verifyDoc.getPageCount());
    } else {
      console.log("----------------------------------------");
      console.log("4. Testing Protect PDF API... SKIPPED (qpdf not found)");
      console.log("----------------------------------------");
      console.log("5. Testing Unlock PDF API with WRONG password... SKIPPED (qpdf not found)");
      console.log("----------------------------------------");
      console.log("6. Testing Unlock PDF API with CORRECT password... SKIPPED (qpdf not found)");
    }
    
    console.log("----------------------------------------");
    console.log("7. Testing Compress PDF API...");
    const compressFormData = new FormData();
    compressFormData.append('file', file1);
    compressFormData.append('compressionLevel', 'medium');

    const compressRes = await fetch('http://localhost:3000/api/pdf/compress', {
      method: 'POST',
      body: compressFormData,
    });

    if (!compressRes.ok) {
      const err = await compressRes.text();
      throw new Error("Compress API failed: " + err);
    }

    const compressedBytes = await compressRes.arrayBuffer();
    writeFileSync('test-compressed.pdf', Buffer.from(compressedBytes));
    
    const origSize = compressRes.headers.get("X-Original-Size");
    const compSize = compressRes.headers.get("X-Compressed-Size");
    const sav = compressRes.headers.get("X-Savings");
    console.log(`SUCCESS: Compressed PDF created. Original: ${origSize} B, Compressed: ${compSize} B, Savings: ${sav}%`);
    
    const verifyCompDoc = await PDFDocument.load(compressedBytes);
    console.log("SUCCESS: Compressed PDF loaded correctly. Page count:", verifyCompDoc.getPageCount());

    console.log("----------------------------------------");
    console.log("8. Testing Rotate PDF API...");
    const rotateFormData = new FormData();
    rotateFormData.append('file', file1);
    rotateFormData.append('rotations', JSON.stringify({ 0: 90 }));

    const rotateRes = await fetch('http://localhost:3000/api/pdf/rotate', {
      method: 'POST',
      body: rotateFormData,
    });

    if (!rotateRes.ok) {
      const err = await rotateRes.text();
      throw new Error("Rotate API failed: " + err);
    }

    const rotatedBytes = await rotateRes.arrayBuffer();
    writeFileSync('test-rotated.pdf', Buffer.from(rotatedBytes));
    
    const verifyRotDoc = await PDFDocument.load(rotatedBytes);
    const pageZeroRotation = verifyRotDoc.getPage(0).getRotation().angle;
    console.log(`SUCCESS: Rotated PDF created. Page 1 rotation: ${pageZeroRotation} degrees`);
    if (pageZeroRotation !== 90) {
      throw new Error(`Expected page 1 to be rotated 90 degrees, but got ${pageZeroRotation}`);
    }

    console.log("----------------------------------------");
    console.log("9. Testing Delete Pages PDF API...");
    const deleteFormData = new FormData();
    const mergedBlob = new Blob([mergedBytes], { type: 'application/pdf' });
    deleteFormData.append('file', mergedBlob, 'test-merged.pdf');
    deleteFormData.append('pages', '1');

    const deleteRes = await fetch('http://localhost:3000/api/pdf/delete-pages', {
      method: 'POST',
      body: deleteFormData,
    });

    if (!deleteRes.ok) {
      const err = await deleteRes.text();
      throw new Error("Delete Pages API failed: " + err);
    }

    const deletedBytes = await deleteRes.arrayBuffer();
    writeFileSync('test-deleted.pdf', Buffer.from(deletedBytes));
    
    const verifyDelDoc = await PDFDocument.load(deletedBytes);
    const delPageCount = verifyDelDoc.getPageCount();
    console.log(`SUCCESS: Cleaned PDF created. Page count: ${delPageCount} (expected: 1)`);
    if (delPageCount !== 1) {
      throw new Error(`Expected page count to be 1, but got ${delPageCount}`);
    }

    console.log("----------------------------------------");
    console.log("10. Testing Extract Pages PDF API...");
    const extractFormData = new FormData();
    extractFormData.append('file', mergedBlob, 'test-merged.pdf');
    extractFormData.append('pages', '2');

    const extractRes = await fetch('http://localhost:3000/api/pdf/extract-pages', {
      method: 'POST',
      body: extractFormData,
    });

    if (!extractRes.ok) {
      const err = await extractRes.text();
      throw new Error("Extract Pages API failed: " + err);
    }

    const extractedBytes = await extractRes.arrayBuffer();
    writeFileSync('test-extracted.pdf', Buffer.from(extractedBytes));
    
    const verifyExtDoc = await PDFDocument.load(extractedBytes);
    const extPageCount = verifyExtDoc.getPageCount();
    console.log(`SUCCESS: Extracted PDF created. Page count: ${extPageCount} (expected: 1)`);
    if (extPageCount !== 1) {
      throw new Error(`Expected page count to be 1, but got ${extPageCount}`);
    }

    console.log("----------------------------------------");
    console.log("11. Testing Images to PDF API...");
    // Minimal valid 1x1 white PNG (binary-safe base64 decoded)
    const minimalPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    const imgFormData = new FormData();
    imgFormData.append('images', new Blob([minimalPng], { type: 'image/png' }), 'test.png');
    imgFormData.append('pageSize', 'A4');
    imgFormData.append('orientation', 'portrait');
    imgFormData.append('margin', 'medium');

    const imgRes = await fetch('http://localhost:3000/api/pdf/images-to-pdf', {
      method: 'POST',
      body: imgFormData,
    });

    if (!imgRes.ok) {
      const err = await imgRes.text();
      throw new Error("Images to PDF API failed: " + err);
    }

    const imgPdfBytes = await imgRes.arrayBuffer();
    writeFileSync('test-images-to-pdf.pdf', Buffer.from(imgPdfBytes));

    const verifyImgDoc = await PDFDocument.load(imgPdfBytes);
    const imgPageCount = verifyImgDoc.getPageCount();
    console.log(`SUCCESS: Images-to-PDF created. Page count: ${imgPageCount} (expected: 1)`);
    if (imgPageCount !== 1) {
      throw new Error(`Expected page count to be 1, but got ${imgPageCount}`);
    }

    console.log("----------------------------------------");
    console.log("12. Testing Organize Pages API...");
    const organizeFormData = new FormData();
    organizeFormData.append('file', mergedFile);
    // Swap the pages: first page 1 (no rotation), then page 0 (90 deg rotation)
    const pageConfig = [
      { originalIndex: 1, rotation: 0 },
      { originalIndex: 0, rotation: 90 }
    ];
    organizeFormData.append('pages', JSON.stringify(pageConfig));

    const organizeRes = await fetch('http://localhost:3000/api/pdf/organize', {
      method: 'POST',
      body: organizeFormData,
    });

    if (!organizeRes.ok) {
      const err = await organizeRes.text();
      throw new Error("Organize Pages API failed: " + err);
    }

    const organizePdfBytes = await organizeRes.arrayBuffer();
    writeFileSync('test-organized.pdf', Buffer.from(organizePdfBytes));

    const verifyOrgDoc = await PDFDocument.load(organizePdfBytes);
    const orgPageCount = verifyOrgDoc.getPageCount();
    console.log(`SUCCESS: Organized PDF created. Page count: ${orgPageCount} (expected: 2)`);
    if (orgPageCount !== 2) {
      throw new Error(`Expected page count to be 2, but got ${orgPageCount}`);
    }

    // Verify rotation of target page index 1 (originally index 0, rotated to 90)
    const orgPages = verifyOrgDoc.getPages();
    const rotatedAngle = orgPages[1].getRotation().angle;
    console.log(`SUCCESS: Rotated page angle in organized PDF: ${rotatedAngle} (expected: 90)`);
    if (rotatedAngle !== 90) {
      throw new Error(`Expected page 1 rotation to be 90, but got ${rotatedAngle}`);
    }

    console.log("----------------------------------------");
    if (hasPdftocairo) {
      console.log("13. Testing PDF to Images API...");
      const ptiFormData = new FormData();
      ptiFormData.append('file', file1);
      ptiFormData.append('format', 'jpeg');
      ptiFormData.append('dpi', '72');

      const ptiRes = await fetch('http://localhost:3000/api/pdf/pdf-to-images', {
        method: 'POST',
        body: ptiFormData,
      });

      if (!ptiRes.ok) {
        const err = await ptiRes.text();
        throw new Error("PDF to Images API failed: " + err);
      }

      const ptiBytes = await ptiRes.arrayBuffer();
      const ptiZip = await JSZip.loadAsync(ptiBytes);
      const ptiFiles = Object.keys(ptiZip.files);
      console.log("SUCCESS: PDF to Images returned a zip file containing:", ptiFiles);
      if (ptiFiles.length !== 1) {
        throw new Error(`Expected 1 file in zip, but got ${ptiFiles.length}`);
      }
      writeFileSync('test-pdf-to-images.zip', Buffer.from(ptiBytes));
    } else {
      console.log("13. Testing PDF to Images API... SKIPPED (pdftocairo not found)");
    }

    console.log("========================================");
    console.log("ALL TESTS PASSED SUCCESSFULLY.");
    console.log("========================================");
    process.exit(0);

  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

runTests();
