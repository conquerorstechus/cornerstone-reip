import { NextRequest, NextResponse } from "next/server";
import { eventDescriptionText } from "@/lib/event-copy";
import {
  configuredMeetingLink,
  eventRegistrationWebhook,
  sessionById,
  verifyCaptcha,
} from "@/lib/event";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    eventId?: string;
    emailConsent?: boolean;
    captchaToken?: string;
    captchaAnswer?: string;
  } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  if (!name || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }
  if (body.emailConsent !== true) {
    return NextResponse.json({ error: "Email consent is required" }, { status: 400 });
  }
  if (!verifyCaptcha(body.captchaToken ?? "", body.captchaAnswer ?? "")) {
    return NextResponse.json({ error: "That math answer didn’t match. Try the new problem." }, { status: 400 });
  }

  const session = sessionById(body.eventId?.trim() ?? "");
  if (!session) {
    return NextResponse.json({ error: "Pick a session in the next 30 days." }, { status: 400 });
  }
  const meetingLink = configuredMeetingLink();
  const payload = {
    action: "event_registration",
    source: "reip-events",
    requestedAt: new Date().toISOString(),
    name,
    email,
    eventId: session.id,
    eventTitle: session.title,
    host: session.host,
    start: session.start,
    end: session.end,
    timeZone: session.timeZone,
    whenLabel: session.whenLabel,
    eventDescription: eventDescriptionText(),
    emailConsent: true,
    ...(meetingLink ? { meetingLink } : {}),
  };

  let res: Response;
  try {
    res = await fetch(eventRegistrationWebhook(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Event registration webhook failed", err);
    return NextResponse.json({ error: "Could not complete registration. Try again." }, { status: 502 });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Event registration webhook rejected", res.status, detail.slice(0, 500));
    return NextResponse.json({ error: "Could not complete registration. Try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
