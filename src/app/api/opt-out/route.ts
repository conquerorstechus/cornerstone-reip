import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_OPT_OUT_WEBHOOK =
  "https://n8n.srv1393511.hstgr.cloud/webhook/form-submission";

/** Opt-out requests. Emails the site owner through the form-submission webhook until OPT_OUT_WEBHOOK_URL is set. */
export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; phone?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  if (!name || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const webhook = process.env.OPT_OUT_WEBHOOK_URL?.trim() || DEFAULT_OPT_OUT_WEBHOOK;
  const payload = {
    action: "opt_out",
    source: "privacy-opt-out",
    requestedAt: new Date().toISOString(),
    name,
    email,
    phone: phone || null,
    request: "Remove this person from marketing emails and texts.",
  };

  let res: Response;
  try {
    res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Opt-out webhook request failed", err);
    return NextResponse.json({ error: "Could not send this request. Try again." }, { status: 502 });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Opt-out webhook rejected submission", res.status, detail.slice(0, 500));
    return NextResponse.json({ error: "Could not send this request. Try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
