import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Merge endpoint ready for Phase 2.",
    operation: "merge",
  });
}
