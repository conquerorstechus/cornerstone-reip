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
        <p className="eyebrow !text-magenta">PRIVACY</p>
        <h1 className="display mt-1 text-2xl font-semibold sm:text-3xl">Opt out</h1>
        <p className="mt-2 text-sm leading-relaxed text-taupe">
          Ask to be removed from marketing emails and texts. This form emails the request to us.
        </p>
      </div>

      {state === "sent" ? (
        <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-4 text-sm font-semibold text-success">
          Request sent. We’ll take you off marketing emails and texts. A confirmation we already
          owe you for a session you registered for may still arrive.
        </p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-lg border border-line bg-white px-5 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-navy">Name</span>
            <input
              name="name"
              required
              autoComplete="name"
              className="w-full rounded-md border border-line px-3 py-2.5 text-[15px] outline-none focus:border-blue"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-navy">Email to remove</span>
            <input
              name="email"
              required
              type="email"
              autoComplete="email"
              inputMode="email"
              className="w-full rounded-md border border-line px-3 py-2.5 text-[15px] outline-none focus:border-blue"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-navy">
              Phone <span className="font-normal text-taupe">(optional)</span>
            </span>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              className="w-full rounded-md border border-line px-3 py-2.5 text-[15px] outline-none focus:border-blue"
            />
          </label>
          {state === "error" && error ? <p className="text-sm text-danger">{error}</p> : null}
          <button
            type="submit"
            disabled={state === "sending"}
            className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-2 disabled:opacity-60"
          >
            {state === "sending" ? "Sending…" : "Send opt-out request"}
          </button>
        </form>
      )}

      <p className="text-[13px] text-taupe">
        <Link href="/privacy" className="font-semibold text-blue hover:underline">
          Privacy policy
        </Link>
      </p>
    </div>
  );
}
