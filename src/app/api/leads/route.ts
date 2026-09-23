import { NextRequest, NextResponse } from "next/server";
import { propertyById } from "@/lib/data";

export const runtime = "nodejs";

const N8N_LEAD_WEBHOOK =
  "https://n8n.srv1393511.hstgr.cloud/webhook/cef18bdf-8d8f-4f94-bc21-8c8e8aff001a";

/** Buyer-agent lead. POSTs contact + listing to n8n (LEAD_WEBHOOK_URL overrides). */
export async function POST(req: NextRequest) {
  let body: { dealId?: string; source?: string; name?: string; email?: string; phone?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const dealId = body.dealId?.trim();
  if (!dealId) {
    return NextResponse.json({ error: "dealId is required" }, { status: 400 });
  }

  const property = await propertyById(dealId);
  if (!property) {
    return NextResponse.json({ error: "Unknown deal" }, { status: 404 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";

  const webhook = process.env.LEAD_WEBHOOK_URL?.trim() || N8N_LEAD_WEBHOOK;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: body.source ?? "high-roi",
          requestedAt: new Date().toISOString(),
          name,
          email,
          phone,
          dealId: property.id,
          rank: property.rank,
          address: property.address,
          city: property.city,
          state: property.state,
          zip: property.zip,
          ask: property.ask,
          offer: property.offer,
          zillowUrl: property.zillowUrl,
        }),
      });
    } catch {
      // Keep the form successful even if the optional webhook is down.
    }
  }

  return NextResponse.json({ ok: true });
}
