import { NextRequest, NextResponse } from "next/server";
import { runLocalAnalysis, webhookForType } from "@/lib/analysis";
import { dispatchToN8n } from "@/lib/n8n";
import { upsertRun } from "@/lib/store";
import type { AnalysisRequest, AssetType } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { id: AssetType | "digest"; query?: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const type: AssetType = body.id === "digest" ? "property" : body.id;
  const query = body.query ?? body.id;
  const request: AnalysisRequest = { type, query };
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  if (webhookForType(body.id)) {
    const run = await upsertRun({
      id,
      type,
      query,
      status: "queued",
      source: "n8n",
      createdAt,
    });
    const sent = await dispatchToN8n(run, request, body.id);
    if (sent.ok) {
      await upsertRun({ ...run, status: "running" });
      return NextResponse.json({ id, status: "running" });
    }
    const result = runLocalAnalysis(request);
    await upsertRun({
      ...run,
      status: "complete",
      source: "local",
      completedAt: new Date().toISOString(),
      error: sent.error,
      result,
    });
    return NextResponse.json({ id, status: "complete", fallback: sent.error });
  }

  const result = runLocalAnalysis(request);
  await upsertRun({
    id,
    type,
    query,
    status: "complete",
    source: "local",
    createdAt,
    completedAt: new Date().toISOString(),
    result,
  });
  return NextResponse.json({ id, status: "complete", source: "local" });
}
