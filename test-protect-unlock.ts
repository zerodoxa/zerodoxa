import { PDFDocument } from 'pdf-lib';
import { writeFileSync, readFileSync } from 'fs';
import { protectPdf, unlockPdf, cleanupTempDirectory } from './services/pdf/protectUnlockService';

async function runTests() {
  try {
    console.log("Creating test PDF...");
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([500, 500]);
    page.drawText('This is a test document!', { x: 50, y: 400, size: 24 });
    const pdfBytes = await pdfDoc.save();
    const inputPath = 'test-input.pdf';
    writeFileSync(inputPath, pdfBytes);

    console.log("1. Testing Protect PDF...");
    const protectResult = await protectPdf({
      inputPath,
      outputPath: "",
      userPassword: "secretpassword123",
      encryptionLevel: "aes-256"
    });
    console.log("Protected PDF created at:", protectResult.outputPath);

    console.log("2. Testing Unlock PDF with WRONG password...");
    try {
      await unlockPdf({
        inputPath: protectResult.outputPath,
        outputPath: "",
        password: "wrongpassword",
      });
      console.error("FAILED: Should have thrown an error for wrong password.");
      process.exit(1);
    } catch (e) {
      console.log("SUCCESS: Caught expected error for wrong password:", (e as Error).message);
    }

    console.log("3. Testing Unlock PDF with CORRECT password...");
    const unlockResult = await unlockPdf({
      inputPath: protectResult.outputPath,
      outputPath: "",
      password: "secretpassword123",
    });
    console.log("Unlocked PDF created at:", unlockResult.outputPath);
    
    // verify unlocked pdf is readable
    const unlockedBytes = readFileSync(unlockResult.outputPath);
    const verifyDoc = await PDFDocument.load(unlockedBytes);
    console.log("SUCCESS: Unlocked PDF loaded correctly. Page count:", verifyDoc.getPageCount());

    // cleanup
    await cleanupTempDirectory(protectResult.outputPath);
    await cleanupTempDirectory(unlockResult.outputPath);
    
    console.log("ALL TESTS PASSED.");
    process.exit(0);

  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

runTests();
