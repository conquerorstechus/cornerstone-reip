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
      <p className="rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold text-white">
        You’re on the list. We’ll send new deals to your email and phone.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "space-y-3" : "space-y-3"}>
      <div className={`grid gap-3 ${compact ? "sm:grid-cols-3" : "sm:grid-cols-3"}`}>
        <label className="block">
          <span className="sr-only">
            Name
          </span>
          <input
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-[15px] text-navy outline-none placeholder:text-taupe-2 focus:border-magenta"
          />
        </label>
        <label className="block">
          <span className="sr-only">
            Email
          </span>
          <input
            name="email"
            required
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-[15px] text-navy outline-none placeholder:text-taupe-2 focus:border-magenta"
          />
        </label>
        <label className="block">
          <span className="sr-only">
            Phone
          </span>
          <input
            name="phone"
            required
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="(813) 555-0100"
            className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-[15px] text-navy outline-none placeholder:text-taupe-2 focus:border-magenta"
          />
        </label>
      </div>
      {state === "error" ? (
        <p className="text-xs text-white">Couldn’t subscribe. Check name, email, and phone, then try again.</p>
      ) : null}
      <button
        type="submit"
        disabled={state === "sending"}
        className="btn btn-primary w-full disabled:opacity-60 sm:w-auto"
      >
        {state === "sending" ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}

export function SubscribeBanner({
  page,
  title = "Get new deals as they land",
  body = "Name, email, and phone. Fresh picks come to you.",
}: {
  page: string;
  title?: string;
  body?: string;
}) {
  return (
    <section className="rounded-2xl bg-navy px-5 py-6 text-white sm:px-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-white/70">{body}</p>
      <div className="mt-4">
        <SubscribeForm page={page} />
      </div>
    </section>
  );
}
