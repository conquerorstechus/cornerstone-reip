import { NextRequest, NextResponse } from "next/server";
import { propertyById } from "@/lib/data";

export const runtime = "nodejs";

/** Buyer-agent lead. Wire LEAD_WEBHOOK_URL to email Sam the listing address. */
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

  const property = propertyById(dealId);
  if (!property) {
    return NextResponse.json({ error: "Unknown deal" }, { status: 404 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";

  const webhook = process.env.LEAD_WEBHOOK_URL?.trim();
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
