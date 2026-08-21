import { NextRequest, NextResponse } from "next/server";
import { runLocalAnalysis } from "@/lib/analysis";
import { upsertRun } from "@/lib/store";
import type { AnalysisRequest, AssetType } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as AnalysisRequest;
  if (!body.query?.trim() || !body.type) {
    return NextResponse.json({ error: "type and query are required" }, { status: 400 });
  }

  const type = body.type as AssetType;
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const result = runLocalAnalysis(body);

  await upsertRun({
    id,
    type,
    query: body.query,
    status: "complete",
    createdAt,
    completedAt: new Date().toISOString(),
    result,
  });
  return NextResponse.json({ id, status: "complete" });
}
