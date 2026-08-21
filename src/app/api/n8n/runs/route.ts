import { NextRequest, NextResponse } from "next/server";
import { getRun, listRuns } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const run = await getRun(id);
    if (!run) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ run });
  }
  return NextResponse.json({ runs: await listRuns() });
}
