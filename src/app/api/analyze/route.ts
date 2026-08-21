import { NextRequest, NextResponse } from "next/server";
import { runLocalAnalysis, webhookForType } from "@/lib/analysis";
import { dispatchToN8n } from "@/lib/n8n";
import { upsertRun } from "@/lib/store";
import type { AnalysisRequest, AssetType } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as AnalysisRequest & {
    forceLocal?: boolean;
    preferN8n?: boolean;
  };
  if (!body.query?.trim() || !body.type) {
    return NextResponse.json({ error: "type and query are required" }, { status: 400 });
  }

  const type = body.type as AssetType;
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const wantN8n = body.preferN8n !== false && !body.forceLocal && Boolean(webhookForType(type));

  if (wantN8n) {
    const run = await upsertRun({
      id,
      type,
      query: body.query,
      status: "queued",
      source: "n8n",
      createdAt,
    });
    const sent = await dispatchToN8n(run, body);
    if (sent.ok) {
      await upsertRun({ ...run, status: "running" });
      return NextResponse.json({ id, status: "running", source: "n8n" });
    }
    const result = runLocalAnalysis(body);
    await upsertRun({
      ...run,
      status: "complete",
      source: "local",
      completedAt: new Date().toISOString(),
      error: `n8n fallback: ${sent.error}`,
      result,
    });
    return NextResponse.json({ id, status: "complete", source: "local", fallback: sent.error });
  }

  const result = runLocalAnalysis(body);
  await upsertRun({
    id,
    type,
    query: body.query,
    status: "complete",
    source: "local",
    createdAt,
    completedAt: new Date().toISOString(),
    result,
  });
  return NextResponse.json({ id, status: "complete", source: "local" });
}
