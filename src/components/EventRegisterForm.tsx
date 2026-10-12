"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CaptchaChallenge, MondaySession } from "../lib/event";

export function EventRegisterForm({
  session,
  captcha,
}: {
  session: MondaySession;
  captcha: CaptchaChallenge;
}) {
  const router = useRouter();
  const [challenge, setChallenge] = useState(captcha);
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  async function refreshCaptcha() {
    const res = await fetch("/api/events/captcha", { cache: "no-store" });
    if (!res.ok) return;
    const next = (await res.json()) as CaptchaChallenge;
    setChallenge(next);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const captchaAnswer = String(data.get("captcha") ?? "").trim();
    if (!name || !email || !captchaAnswer) {
      setState("error");
      setError("Enter your name, email, and the math answer.");
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

  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)] ring-1 ring-black/5 sm:p-6">
      <h2 className="text-lg font-semibold text-[#111827]">Register</h2>
      <p className="mt-1 text-sm text-[#6b7280]">You’ll get an email with the meeting link and a calendar invite.</p>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-[#111827] bg-[#fafafa] px-3 py-3">
        <input type="radio" name="event" checked readOnly className="mt-1 accent-[#111827]" />
        <span>
          <span className="block text-sm font-semibold text-[#111827]">{session.dateLine}</span>
          <span className="block text-sm text-[#4b5563]">{session.timeLine}</span>
        </span>
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-medium text-[#111827]">Name</span>
        <input
          name="name"
          required
          autoComplete="name"
          placeholder="Your name"
          className="w-full rounded-xl border border-[#e5e7eb] px-3 py-3 text-[15px] outline-none focus:border-[#111827]"
        />
      </label>
      <label className="mt-3 block">
        <span className="mb-1.5 block text-sm font-medium text-[#111827]">Email</span>
        <input
          name="email"
          required
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          className="w-full rounded-xl border border-[#e5e7eb] px-3 py-3 text-[15px] outline-none focus:border-[#111827]"
        />
      </label>
      <label className="mt-3 block">
        <span className="mb-1.5 block text-sm font-medium text-[#111827]">
          What is {challenge.a} + {challenge.b}?
        </span>
        <input
          name="captcha"
          required
          inputMode="numeric"
          autoComplete="off"
          placeholder="Answer"
          className="w-full rounded-xl border border-[#e5e7eb] px-3 py-3 text-[15px] outline-none focus:border-[#111827]"
        />
      </label>

      {state === "error" && error ? (
        <p className="mt-3 text-sm text-[#b91c1c]">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#111827] text-[15px] font-semibold text-white hover:bg-black disabled:opacity-60"
      >
        {state === "sending" ? "Registering…" : "Register"}
      </button>
    </form>
  );
}
