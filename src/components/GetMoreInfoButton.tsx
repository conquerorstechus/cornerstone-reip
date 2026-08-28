"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

export function GetMoreInfoButton({ dealId }: { dealId: string }) {
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
    if (!submittedName || !submittedEmail || !submittedPhone) {
      setState("error");
      return;
    }

    setState("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId,
          source: "high-roi",
          name: submittedName,
          email: submittedEmail,
          phone: submittedPhone,
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
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-navy/50 p-4 sm:items-center">
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
              className="relative z-[101] w-full max-w-md bg-cream p-5 shadow-lg ring-1 ring-line sm:p-6"
            >
              {state === "sent" ? (
                <div>
                  <p className="display text-[10px] tracking-[0.24em] text-magenta">REQUEST</p>
                  <h2 id={titleId} className="display mt-1 text-lg font-semibold tracking-wide">
                    Received. Submitted.
                  </h2>
                  <p className="mt-2 text-sm text-taupe">We’ll follow up with the address and details.</p>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-5 inline-flex min-h-11 items-center bg-magenta px-4 py-2 text-sm font-semibold tracking-wide text-white hover:bg-magenta-dark"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit}>
                  <p className="display text-[10px] tracking-[0.24em] text-magenta">GET MORE INFO</p>
                  <h2 id={titleId} className="display mt-1 text-lg font-semibold tracking-wide">
                    Leave your contact
                  </h2>
                  <p className="mt-1 text-sm text-taupe">We’ll send listing details to you.</p>

                  <label className="mt-5 block">
                    <span className="display text-[10px] tracking-[0.2em] text-taupe">NAME</span>
                    <input
                      name="leadName"
                      required
                      autoComplete="name"
                      className="mt-1 w-full border-0 border-b border-line bg-transparent py-2 outline-none focus:border-blue"
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="display text-[10px] tracking-[0.2em] text-taupe">EMAIL</span>
                    <input
                      name="leadEmail"
                      required
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      className="mt-1 w-full border-0 border-b border-line bg-transparent py-2 outline-none focus:border-blue"
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="display text-[10px] tracking-[0.2em] text-taupe">PHONE NUMBER</span>
                    <input
                      name="leadPhone"
                      required
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="(813) 555-0100"
                      className="mt-1 w-full border-0 border-b border-line bg-transparent py-2 outline-none focus:border-blue"
                    />
                  </label>

                  {state === "error" ? (
                    <p className="mt-3 text-xs text-danger">Couldn’t send. Try again.</p>
                  ) : null}

                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={state === "sending"}
                      className="inline-flex min-h-11 items-center bg-magenta px-4 py-2 text-sm font-semibold tracking-wide text-white hover:bg-magenta-dark disabled:opacity-60"
                    >
                      {state === "sending" ? "Sending…" : "Submit"}
                    </button>
                    <button
                      type="button"
                      onClick={close}
                      disabled={state === "sending"}
                      className="inline-flex min-h-11 items-center px-4 py-2 text-sm font-semibold tracking-wide text-taupe hover:text-ink disabled:opacity-60"
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
        <p className="text-sm text-success">Received. Submitted.</p>
      ) : (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            if (state === "error") setState("idle");
          }}
          className="inline-flex min-h-11 items-center bg-magenta px-4 py-2 text-sm font-semibold tracking-wide text-white hover:bg-magenta-dark"
        >
          Get more info
        </button>
      )}
      {dialog}
    </>
  );
}
