import { NextRequest, NextResponse } from "next/server";
import { landById, propertyById } from "@/lib/data";

export const runtime = "nodejs";

const N8N_LEAD_WEBHOOK =
  "https://n8n.srv1393511.hstgr.cloud/webhook/cef18bdf-8d8f-4f94-bc21-8c8e8aff001a";

type MortgageQuote = {
  price?: number;
  downPayment?: number;
  downPct?: number;
  rate?: number;
  program?: string;
  zip?: string;
  loanAmount?: number;
  taxes?: number;
  insurance?: number;
  hoa?: number;
};

/** Lead capture: deliver street address to the buyer via email + SMS (n8n). */
export async function POST(req: NextRequest) {
  let body: {
    dealId?: string;
    dealType?: "property" | "land" | "mortgage";
    source?: string;
    deliverImmediately?: boolean;
    name?: string;
    email?: string;
    phone?: string;
    mortgage?: MortgageQuote;
  } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  if (!email || !phone) {
    return NextResponse.json({ error: "email and phone are required" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const webhook = process.env.LEAD_WEBHOOK_URL?.trim() || N8N_LEAD_WEBHOOK;

  // Mortgage quote request (no deal required)
  if (body.dealType === "mortgage" || body.source === "mortgage-quote") {
    const m = body.mortgage ?? {};
    const payload = {
      action: "mortgage_quote_request",
      deliverImmediately: body.deliverImmediately !== false,
      source: body.source ?? "mortgage-quote",
      requestedAt: new Date().toISOString(),
      name,
      email,
      phone,
      dealType: "mortgage" as const,
      mortgage: {
        price: m.price ?? null,
        downPayment: m.downPayment ?? null,
        downPct: m.downPct ?? null,
        rate: m.rate ?? null,
        program: m.program ?? null,
        zip: m.zip ?? null,
        loanAmount: m.loanAmount ?? null,
        taxes: m.taxes ?? null,
        insurance: m.insurance ?? null,
        hoa: m.hoa ?? null,
      },
      messageToLead: `Thanks — Arki Koul at Shopwise Mortgage will follow up with a Closing Disclosure–level quote for your scenario (price ${m.price ?? "n/a"}, down ${m.downPct ?? "n/a"}%, rate ${m.rate ?? "n/a"}%).`,
    };

    if (webhook) {
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // Keep the form successful even if the optional webhook is down.
      }
    }

    return NextResponse.json({ ok: true, delivered: true });
  }

  const dealId = body.dealId?.trim();
  if (!dealId) {
    return NextResponse.json({ error: "dealId is required" }, { status: 400 });
  }

  const dealType = body.dealType === "land" ? "land" : "property";
  const property = dealType === "property" ? await propertyById(dealId) : null;
  const land = dealType === "land" ? await landById(dealId) : null;
  if (!property && !land) {
    return NextResponse.json({ error: "Unknown deal" }, { status: 404 });
  }

  const payload =
    property != null
      ? {
          action: "send_deal_to_lead",
          deliverImmediately: body.deliverImmediately !== false,
          source: body.source ?? "high-roi",
          requestedAt: new Date().toISOString(),
          name,
          email,
          phone,
          dealType: "property" as const,
          dealId: property.id,
          rank: property.rank,
          address: property.address,
          city: property.city,
          state: property.state,
          zip: property.zip,
          ask: property.ask,
          offer: property.offer,
          rent: property.rent,
          cashFlow: property.cashFlow,
          beds: property.beds,
          baths: property.baths,
          sqft: property.sqft,
          homeKind: property.homeKind ?? "sfh",
          messageToLead: `Here is the listing you requested: ${property.address}, ${property.city}, ${property.state} ${property.zip}. Ask ${property.ask}. Offer ${property.offer}. Est. rent ${property.rent}/mo. Cash flow ${property.cashFlow}/mo.`,
        }
      : {
          action: "send_deal_to_lead",
          deliverImmediately: body.deliverImmediately !== false,
          source: body.source ?? "high-roi",
          requestedAt: new Date().toISOString(),
          name,
          email,
          phone,
          dealType: "land" as const,
          dealId: land!.id,
          rank: land!.rank,
          address: land!.address,
          city: land!.city,
          state: "FL",
          zip: land!.zip,
          ask: land!.asking,
          offer: land!.offer ?? land!.asking,
          acres: land!.acres,
          cashFlow: land!.cashFlow ?? 0,
          messageToLead: `Here is the lot you requested: ${land!.address}, ${land!.city}, FL ${land!.zip}. Asking ${land!.asking}. ${land!.acres} acres.`,
        };

  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Keep the form successful even if the optional webhook is down.
    }
  }

  return NextResponse.json({ ok: true, delivered: true });
}
