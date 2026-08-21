import { NextRequest, NextResponse } from "next/server";
import { runLocalAnalysis } from "@/lib/analysis";
import { isN8nAuthorized } from "@/lib/n8n";
import { getRun, upsertRun } from "@/lib/store";
import type { AnalysisResult, AssetType } from "@/lib/types";

export const runtime = "nodejs";

type Callback = {
  runId: string;
  type?: AssetType;
  query?: string;
  result?: AnalysisResult;
  error?: string;
  status?: "complete" | "failed";
};

export async function POST(req: NextRequest) {
  if (!isN8nAuthorized(req.headers.get("x-webhook-secret"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Callback;
  if (!body.runId) {
    return NextResponse.json({ error: "runId required" }, { status: 400 });
  }

  const existing = await getRun(body.runId);
  if (!existing) {
    return NextResponse.json({ error: "unknown runId" }, { status: 404 });
  }

  if (body.error || body.status === "failed") {
    await upsertRun({
      ...existing,
      status: "failed",
      completedAt: new Date().toISOString(),
      error: body.error ?? "n8n reported failure",
    });
    return NextResponse.json({ ok: true, status: "failed" });
  }

  const result =
    body.result ??
    runLocalAnalysis({
      type: body.type ?? existing.type,
      query: body.query ?? existing.query,
    });

  await upsertRun({
    ...existing,
    status: "complete",
    completedAt: new Date().toISOString(),
    result,
  });
  return NextResponse.json({ ok: true, status: "complete" });
}
