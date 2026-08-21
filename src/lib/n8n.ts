import { webhookForType } from "./analysis";
import type { AnalysisRequest, AnalysisRun, AssetType } from "./types";

export function n8nConfigured() {
  return Boolean(process.env.N8N_BASE_URL && process.env.N8N_SHARED_SECRET);
}

export function isN8nAuthorized(header: string | null) {
  const secret = process.env.N8N_SHARED_SECRET;
  if (!secret) return true;
  return header === secret;
}

export async function dispatchToN8n(
  run: AnalysisRun,
  req: AnalysisRequest,
  workflow: AssetType | "digest" = run.type,
): Promise<{ ok: boolean; error?: string }> {
  const url = webhookForType(workflow);
  if (!url) return { ok: false, error: "No n8n webhook configured for this analysis type." };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": process.env.N8N_SHARED_SECRET ?? "",
      },
      body: JSON.stringify({
        runId: run.id,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/webhooks/n8n`,
        ...req,
        createdAt: run.createdAt,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `n8n ${res.status}: ${text.slice(0, 180)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "n8n unreachable" };
  }
}

export const WORKFLOWS: {
  id: AssetType | "digest";
  name: string;
  env: string;
  file: string;
  description: string;
}[] = [
  {
    id: "property",
    name: "Property analysis",
    env: "N8N_WEBHOOK_PROPERTY",
    file: "rip-property-analysis.json",
    description: "Underwrite a single-family / townhome: offer, rent, NOI, mortgage at 50% down.",
  },
  {
    id: "area",
    name: "Area analysis",
    env: "N8N_WEBHOOK_AREA",
    file: "rip-area-analysis.json",
    description: "Submarket snapshot — demographics, rents, jobs, flood, investor score.",
  },
  {
    id: "land",
    name: "Land analysis",
    env: "N8N_WEBHOOK_LAND",
    file: "rip-land-analysis.json",
    description: "Parcel feasibility: zoning, units, comps, hold vs. develop scenarios.",
  },
  {
    id: "multifamily",
    name: "Multifamily analysis",
    env: "N8N_WEBHOOK_MULTIFAMILY",
    file: "rip-multifamily-analysis.json",
    description: "Small MF / garden underwriting: cap rate, GRM, debt yield, unit mix.",
  },
  {
    id: "digest",
    name: "High ROI digest",
    env: "N8N_WEBHOOK_DIGEST",
    file: "rip-high-roi-digest.json",
    description: "Weekly ranked cash-flow digest — same shape as Sam's High ROI Picks email.",
  },
];
