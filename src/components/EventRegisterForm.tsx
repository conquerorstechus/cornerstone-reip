"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CaptchaChallenge, MondaySession } from "../lib/event";
import {
  EVENT_DESCRIPTION,
  EVENT_DISCLAIMER,
  PRESENTER_INTRO_LABEL,
  PRESENTER_INTRO_URL,
} from "../lib/event-copy";

function stillAhead(sessions: MondaySession[]) {
  const now = Date.now();
  return sessions.filter((item) => Date.parse(item.start) > now);
}

export function EventRegistration({
  sessions,
  captcha,
}: {
  sessions: MondaySession[];
  captcha: CaptchaChallenge;
}) {
  const upcoming = stillAhead(sessions);
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(upcoming[0]?.id ?? "");
  const [challenge, setChallenge] = useState(captcha);
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const session = upcoming.find((item) => item.id === selectedId) ?? upcoming[0];

  async function refreshCaptcha() {
    const res = await fetch("/api/events/captcha", { cache: "no-store" });
    if (!res.ok) return;
    const next = (await res.json()) as CaptchaChallenge;
    setChallenge(next);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending" || !session) return;
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const captchaAnswer = String(data.get("captcha") ?? "").trim();
    const emailConsent = data.get("emailConsent") === "on";
    if (!name || !email || !captchaAnswer) {
      setState("error");
      setError("Enter your name, email, and the math answer.");
      return;
    }
    if (!emailConsent) {
      setState("error");
      setError("Agree to receive emails to register.");
      return;
    }

    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          eventId: session.id,
          emailConsent: true,
          captchaToken: challenge.token,
          captchaAnswer,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Could not register");
      }
      router.push("/events/thanks");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Could not register");
      await refreshCaptcha();
      const input = e.currentTarget.elements.namedItem("captcha");
      if (input instanceof HTMLInputElement) input.value = "";
    }
  }

  if (!session) {
    return (
      <p className="text-sm text-ink/70">No upcoming sessions in the next month. Check back soon.</p>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <article>
        <div className="overflow-hidden rounded-3xl bg-[linear-gradient(145deg,#5b21b6_0%,#db2777_55%,#fb7185_100%)] px-6 py-8 text-white shadow-[0_12px_40px_rgba(91,33,182,0.25)] sm:px-8 sm:py-10">
          <div className="inline-flex flex-col items-center rounded-2xl bg-white px-4 py-2 text-navy">
            <span className="text-[11px] font-bold tracking-[0.16em] text-magenta-dark">{session.weekdayShort}</span>
            <span className="text-2xl font-bold leading-none">{session.dayNum}</span>
            <span className="text-[11px] font-semibold tracking-wide text-taupe">{session.monthShort}</span>
          </div>
          <h1 className="mt-6 max-w-xl text-2xl font-semibold leading-tight tracking-tight sm:mt-8 sm:text-4xl">{session.title}</h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/90">
            Thirty minutes, 7:30 to 8:00 PM. Pick any Monday in the next month.
          </p>
        </div>

        <div className="mt-6 max-w-xl space-y-4 text-[15px] leading-relaxed text-ink/80">
          {EVENT_DESCRIPTION.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>
            Presenter Intro:{" "}
            <a
              href={PRESENTER_INTRO_URL}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue underline"
            >
              {PRESENTER_INTRO_LABEL}
            </a>
          </p>
          <p className="text-[12px] leading-relaxed text-taupe">Disclaimer: {EVENT_DISCLAIMER}</p>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
            SK
          </div>
          <div>
            <p className="text-sm font-semibold text-navy">Hosted by {session.host}</p>
            <p className="text-sm text-taupe">REIP · Greater Tampa</p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 text-sm text-ink/80">
          <div>
            <dt className="text-xs font-semibold tracking-wide text-taupe uppercase">When</dt>
            <dd className="mt-0.5 font-medium text-navy">{session.whenLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-taupe uppercase">Where</dt>
            <dd className="mt-0.5">Online. The link is in your confirmation email and calendar invite.</dd>
          </div>
        </dl>
      </article>

      <form onSubmit={onSubmit} className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)] ring-1 ring-black/5 sm:p-6">
        <h2 className="text-lg font-semibold text-navy">Register</h2>
        <p className="mt-1 text-sm text-taupe">Choose a Monday, then we’ll email the meeting link and a calendar invite.</p>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-navy">Session</span>
          <select
            name="event"
            value={session.id}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-3 py-3 text-[15px] outline-none focus:border-navy"
          >
            {upcoming.map((item) => (
              <option key={item.id} value={item.id}>
                {item.dateLine} · {item.timeLine}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-navy">Name</span>
          <input
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            className="w-full rounded-xl border border-line px-3 py-3 text-[15px] outline-none focus:border-navy"
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-medium text-navy">Email</span>
          <input
            name="email"
            required
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-line px-3 py-3 text-[15px] outline-none focus:border-navy"
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-medium text-navy">
            What is {challenge.a} + {challenge.b}?
          </span>
          <input
            name="captcha"
            required
            inputMode="numeric"
            autoComplete="off"
            placeholder="Answer"
            className="w-full rounded-xl border border-line px-3 py-3 text-[15px] outline-none focus:border-navy"
          />
        </label>

        <label className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-taupe">
          <input name="emailConsent" type="checkbox" required className="mt-0.5 accent-navy" />
          <span>
            I agree to receive emails about this session and related updates. I can{" "}
            <Link href="/opt-out" className="font-medium text-ink/80 underline">
              opt out
            </Link>{" "}
            at any time.{" "}
            <Link href="/privacy" className="font-medium text-ink/80 underline">
              Privacy policy
            </Link>
          </span>
        </label>

        {state === "error" && error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          disabled={state === "sending"}
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-navy text-[15px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {state === "sending" ? "Registering…" : "Register"}
        </button>
      </form>
    </div>
  );
}
