import { NextRequest, NextResponse } from "next/server";
import { DIGEST } from "@/lib/data";
import { isN8nAuthorized } from "@/lib/n8n";

/** Payload n8n can pull for the weekly High ROI digest email. */
export async function GET(req: NextRequest) {
  if (!isN8nAuthorized(req.headers.get("x-webhook-secret"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    title: DIGEST.title,
    date: DIGEST.date,
    intro: DIGEST.intro,
    deals: DIGEST.deals.map((d) => ({
      rank: d.rank,
      address: `${d.address}, ${d.city}, ${d.state} ${d.zip}`,
      zillowUrl: d.zillowUrl,
      description: d.description,
      ask: d.ask,
      offer: d.offer,
      cashFlow: d.cashFlow,
      rent: d.rent,
      taxMonthly: d.taxMonthly,
      hoaMonthly: d.hoaMonthly,
      insuranceMonthly: d.insuranceMonthly,
      mortgageMonthly: d.mortgageMonthly,
      beds: d.beds,
      baths: d.baths,
      sqft: d.sqft,
    })),
    assumptions: {
      rate: 0.07,
      term: "30yr",
      down: 0.5,
      note: "Cash flow is NOI (rent − tax − HOA − insurance). Mortgage shown separately.",
    },
  });
}
