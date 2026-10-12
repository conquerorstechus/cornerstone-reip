import { NextResponse } from "next/server";
import { issueCaptcha } from "@/lib/event";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(issueCaptcha());
}
