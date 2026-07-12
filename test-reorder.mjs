import fs from "fs";
import path from "path";


// Using native fetch in Node 18+
async function runTest() {
  const fileBuffer = fs.readFileSync("test-merged.pdf"); // Assume this has multiple pages
  const fileBlob = new Blob([fileBuffer], { type: "application/pdf" });
  
  const formData = new FormData();
  formData.append("file", fileBlob, "test-merged.pdf");
  // Let's reverse the pages as a test (assuming test-merged.pdf has at least 2 pages)
  // For simplicity, let's just supply [1, 0] or something similar, or just [0]
  formData.append("pages", JSON.stringify([0]));

  console.log("Submitting to http://localhost:3000/api/pdf/reorder ...");
  try {
    const res = await fetch("http://127.0.0.1:3000/api/pdf/reorder", {
      method: "POST",
      body: formData,
    });
    
    if (res.ok) {
      console.log("Success! Status:", res.status);
      const outputBuffer = await res.arrayBuffer();
      fs.writeFileSync("test-reordered-output.pdf", Buffer.from(outputBuffer));
      console.log("Wrote test-reordered-output.pdf");
    } else {
      console.error("Error from API:", res.status);
      console.error(await res.text());
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

runTest();
