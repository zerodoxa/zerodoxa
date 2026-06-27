import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Compress endpoint ready for Phase 2.",
    operation: "compress",
  });
}
