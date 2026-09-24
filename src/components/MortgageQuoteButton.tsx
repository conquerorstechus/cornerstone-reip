"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { LOAN_OFFICER } from "../lib/loan-officer";

export type MortgageQuoteScenario = {
  price: number;
  downPayment: number;
  downPct: number;
  rate: number;
  program: string;
  zip: string;
  loanAmount: number;
  taxes: number;
  insurance: number;
  hoa: number;
};

export function MortgageQuoteButton({
  scenario,
  label = "Email for a Closing Disclosure–level quote",
}: {
  scenario: MortgageQuoteScenario;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const submittedName = String(data.get("leadName") ?? "").trim();
    const submittedEmail = String(data.get("leadEmail") ?? "").trim();
    const submittedPhone = String(data.get("leadPhone") ?? "").trim();
    if (!submittedEmail || !submittedPhone) {
      setState("error");
      return;
    }

    setState("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealType: "mortgage",
          source: "mortgage-quote",
          deliverImmediately: true,
          name: submittedName,
          email: submittedEmail,
          phone: submittedPhone,
          mortgage: scenario,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setState("sent");
    } catch {
      setState("error");
    }
  }

  function close() {
    if (state === "sending") return;
    setOpen(false);
    if (state !== "sent") setState("idle");
  }

  const dialog =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0f172a]/50 p-4 sm:items-center">
            <button
              type="button"
              aria-label="Close form"
              className="absolute inset-0"
              onClick={close}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative z-[101] w-full max-w-md rounded-xl bg-white p-5 shadow-lg ring-1 ring-[#e5e7eb] sm:p-6"
            >
              {state === "sent" ? (
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-[#2563eb] uppercase">
                    Sent
                  </p>
                  <h2 id={titleId} className="mt-1 text-lg font-bold text-[#1e3a5f]">
                    Quote request received
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
                    {LOAN_OFFICER.name} at {LOAN_OFFICER.company} will follow up at your email and
                    phone with a more accurate quote for this scenario.
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit}>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-[#2563eb] uppercase">
                    Accurate quote
                  </p>
                  <h2 id={titleId} className="mt-1 text-lg font-bold text-[#1e3a5f]">
                    Where should we reach you?
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-[#6b7280]">
                    Share your email and phone. We’ll include your calculator numbers (
                    {Math.round(scenario.price).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    })}
                    , {scenario.downPct.toFixed(1)}% down, {scenario.rate}% rate) so{" "}
                    {LOAN_OFFICER.name} can respond with a Closing Disclosure–level quote.
                  </p>

                  <label className="mt-5 block">
                    <span className="text-[11px] font-semibold tracking-wide text-[#6b7280] uppercase">
                      Email <span className="text-[#f97316]">*</span>
                    </span>
                    <input
                      name="leadEmail"
                      required
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      className="mt-1 w-full rounded-md border border-[#e5e7eb] px-3 py-2.5 text-[15px] outline-none focus:border-[#2563eb]"
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="text-[11px] font-semibold tracking-wide text-[#6b7280] uppercase">
                      Phone <span className="text-[#f97316]">*</span>
                    </span>
                    <input
                      name="leadPhone"
                      required
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="(813) 555-0100"
                      className="mt-1 w-full rounded-md border border-[#e5e7eb] px-3 py-2.5 text-[15px] outline-none focus:border-[#2563eb]"
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="text-[11px] font-semibold tracking-wide text-[#6b7280] uppercase">
                      Name <span className="font-normal normal-case text-[#94a3b8]">(optional)</span>
                    </span>
                    <input
                      name="leadName"
                      autoComplete="name"
                      className="mt-1 w-full rounded-md border border-[#e5e7eb] px-3 py-2.5 text-[15px] outline-none focus:border-[#2563eb]"
                    />
                  </label>

                  {state === "error" ? (
                    <p className="mt-3 text-xs text-[#dc2626]">
                      Couldn’t send. Check email and phone, then try again.
                    </p>
                  ) : null}

                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={state === "sending"}
                      className="inline-flex min-h-11 items-center rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
                    >
                      {state === "sending" ? "Sending…" : "Request quote"}
                    </button>
                    <button
                      type="button"
                      onClick={close}
                      disabled={state === "sending"}
                      className="inline-flex min-h-11 items-center px-4 py-2 text-sm font-semibold text-[#6b7280] hover:text-[#1e3a5f] disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {state === "sent" && !open ? (
        <p className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-center text-sm font-semibold text-[#15803d]">
          Sent — {LOAN_OFFICER.name} will follow up shortly.
        </p>
      ) : (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            if (state === "error") setState("idle");
          }}
          className="flex min-h-11 w-full items-center justify-center rounded-lg border border-[#2563eb] px-4 text-[14px] font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
        >
          {label}
        </button>
      )}
      {dialog}
    </>
  );
}
