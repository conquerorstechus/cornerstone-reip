"use client";

import { useState } from "react";

export function SubscribeForm({
  page = "site",
  compact = false,
}: {
  page?: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    if (!name || !email || !phone) {
      setState("error");
      return;
    }

    setState("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, page }),
      });
      if (!res.ok) throw new Error("Request failed");
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#15803d]">
        You’re on the list. We’ll send new deals to your email and phone.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "space-y-3" : "space-y-3"}>
      <div className={`grid gap-3 ${compact ? "sm:grid-cols-3" : "sm:grid-cols-3"}`}>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold tracking-wide text-[#6b7280] uppercase">
            Name
          </span>
          <input
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            className="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2.5 text-[15px] text-[#1e3a5f] outline-none focus:border-[#2563eb]"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold tracking-wide text-[#6b7280] uppercase">
            Email
          </span>
          <input
            name="email"
            required
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2.5 text-[15px] text-[#1e3a5f] outline-none focus:border-[#2563eb]"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold tracking-wide text-[#6b7280] uppercase">
            Phone
          </span>
          <input
            name="phone"
            required
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="(813) 555-0100"
            className="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2.5 text-[15px] text-[#1e3a5f] outline-none focus:border-[#2563eb]"
          />
        </label>
      </div>
      {state === "error" ? (
        <p className="text-xs text-[#dc2626]">Couldn’t subscribe. Check name, email, and phone, then try again.</p>
      ) : null}
      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex min-h-11 items-center rounded-lg bg-[#be185d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9d174d] disabled:opacity-60"
      >
        {state === "sending" ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}

export function SubscribeBanner({
  page,
  title = "Get new deals as they land",
  body = "Leave your name, email, and phone. We’ll send fresh High ROI picks instead of making you check back.",
}: {
  page: string;
  title?: string;
  body?: string;
}) {
  return (
    <section className="rounded-xl border border-[#fbcfe8] bg-[#fdf2f8] px-4 py-5 sm:px-5">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-[#be185d] uppercase">Subscribe</p>
      <h2 className="mt-1 text-lg font-bold text-[#1e3a5f]">{title}</h2>
      <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[#4b5563]">{body}</p>
      <div className="mt-4">
        <SubscribeForm page={page} />
      </div>
    </section>
  );
}
