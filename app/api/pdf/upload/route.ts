import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Upload endpoint ready for Phase 2.",
    job: {
      operation: "upload",
      status: "idle",
      progress: 0,
      stage: "Pending",
    },
  });
}
