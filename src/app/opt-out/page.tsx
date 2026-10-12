"use client";

import Link from "next/link";
import { useState } from "react";

export default function OptOutPage() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    if (!name || !email) {
      setState("error");
      setError("Enter your name and email.");
      return;
    }

    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/opt-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Could not send this request");
      }
      setState("sent");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Could not send this request");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">PRIVACY</p>
        <h1 className="display mt-1 text-2xl font-semibold sm:text-3xl">Opt out</h1>
        <p className="mt-2 text-sm leading-relaxed text-taupe">
          Ask to be removed from marketing emails and texts. This form emails the request to us.
        </p>
      </div>

      {state === "sent" ? (
        <p className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-4 text-sm font-semibold text-[#15803d]">
          Request sent. We’ll take you off marketing emails and texts. A confirmation we already
          owe you for a session you registered for may still arrive.
        </p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-lg border border-[#e5e7eb] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1e3a5f]">Name</span>
            <input
              name="name"
              required
              autoComplete="name"
              className="w-full rounded-md border border-[#e5e7eb] px-3 py-2.5 text-[15px] outline-none focus:border-[#2563eb]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1e3a5f]">Email to remove</span>
            <input
              name="email"
              required
              type="email"
              autoComplete="email"
              inputMode="email"
              className="w-full rounded-md border border-[#e5e7eb] px-3 py-2.5 text-[15px] outline-none focus:border-[#2563eb]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1e3a5f]">
              Phone <span className="font-normal text-[#6b7280]">(optional)</span>
            </span>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              className="w-full rounded-md border border-[#e5e7eb] px-3 py-2.5 text-[15px] outline-none focus:border-[#2563eb]"
            />
          </label>
          {state === "error" && error ? <p className="text-sm text-[#b91c1c]">{error}</p> : null}
          <button
            type="submit"
            disabled={state === "sending"}
            className="inline-flex min-h-11 items-center rounded-md bg-[#1e3a5f] px-4 text-sm font-semibold text-white hover:bg-[#162c49] disabled:opacity-60"
          >
            {state === "sending" ? "Sending…" : "Send opt-out request"}
          </button>
        </form>
      )}

      <p className="text-[13px] text-[#6b7280]">
        <Link href="/privacy" className="font-semibold text-[#1d4ed8] hover:underline">
          Privacy policy
        </Link>
      </p>
    </div>
  );
}
