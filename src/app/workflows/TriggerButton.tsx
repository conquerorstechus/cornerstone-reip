"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AssetType } from "../../lib/types";

export function TriggerButton({ id }: { id: AssetType | "digest" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const res = await fetch("/api/n8n/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          query:
            id === "digest"
              ? "Tampa Bay High ROI digest"
              : id === "area"
                ? "Wesley Chapel, FL"
                : id === "land"
                  ? "US-301 & Chancey Road, Zephyrhills"
                  : id === "multifamily"
                    ? "Meadow Glen Apartments, Wesley Chapel"
                    : "403 Thicket Crest Road, Seffner, FL 33584",
        }),
      });
      const json = await res.json();
      if (json.id) router.push(`/reports/${json.id}`);
      else router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={run}
      disabled={busy}
      className="bg-blue px-3 py-2 text-sm font-semibold text-white hover:bg-blue-bright disabled:opacity-60"
    >
      {busy ? "Triggering…" : "Trigger"}
    </button>
  );
}
