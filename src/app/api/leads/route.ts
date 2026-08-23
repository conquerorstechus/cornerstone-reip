import { NextRequest, NextResponse } from "next/server";
import { propertyById } from "@/lib/data";

export const runtime = "nodejs";

/** Buyer-agent lead. Wire LEAD_WEBHOOK_URL to email Sam the listing address. */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { dealId?: string; source?: string };
  const dealId = body.dealId?.trim();
  if (!dealId) {
    return NextResponse.json({ error: "dealId is required" }, { status: 400 });
  }

  const property = propertyById(dealId);
  if (!property) {
    return NextResponse.json({ error: "Unknown deal" }, { status: 404 });
  }

  const webhook = process.env.LEAD_WEBHOOK_URL?.trim();
  if (webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: body.source ?? "high-roi",
        requestedAt: new Date().toISOString(),
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
    if (!res.ok) {
      return NextResponse.json({ error: "Webhook failed" }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
