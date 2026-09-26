import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** Same destination as lead forms until SUBSCRIBE_WEBHOOK_URL is set. */
const DEFAULT_SUBSCRIBE_WEBHOOK =
  "https://n8n.srv1393511.hstgr.cloud/webhook/form-submission";

/** Newsletter / digest subscribe. Swap SUBSCRIBE_WEBHOOK_URL later without touching lead capture. */
export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; phone?: string; page?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  if (!name || !email || !phone) {
    return NextResponse.json({ error: "name, email, and phone are required" }, { status: 400 });
  }

  const webhook = process.env.SUBSCRIBE_WEBHOOK_URL?.trim() || DEFAULT_SUBSCRIBE_WEBHOOK;
  const payload = {
    action: "subscribe",
    source: "subscribe",
    requestedAt: new Date().toISOString(),
    name,
    email,
    phone,
    page: body.page?.trim() || null,
  };

  let res: Response;
  try {
    res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Subscribe webhook request failed", err);
    return NextResponse.json({ error: "Could not record this subscription" }, { status: 502 });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Subscribe webhook rejected submission", res.status, detail.slice(0, 500));
    return NextResponse.json({ error: "Could not record this subscription" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
