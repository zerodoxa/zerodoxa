import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Rotate endpoint ready for Phase 2.",
    operation: "rotate",
  });
}
