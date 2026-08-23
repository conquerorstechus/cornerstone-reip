"use client";

import { useState } from "react";

export function GetMoreInfoButton({ dealId }: { dealId: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onClick() {
    if (state === "sending" || state === "sent") return;
    setState("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, source: "high-roi" }),
      });
      if (!res.ok) throw new Error("Request failed");
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p className="text-sm text-success">Request sent. We’ll follow up with the address and details.</p>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={state === "sending"}
        className="inline-flex min-h-11 items-center bg-magenta px-4 py-2 text-sm font-semibold tracking-wide text-white hover:bg-magenta-dark disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Get more info"}
      </button>
      {state === "error" ? (
        <p className="text-xs text-danger">Couldn’t send. Try again.</p>
      ) : null}
    </div>
  );
}
