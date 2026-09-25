"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { refreshListingsCache } from "../app/actions/refresh-listings";

/** Unlabeled control at the end of the site disclaimer. Refreshes the listings cache. */
export function RefreshListingsButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      aria-label="Refresh"
      onClick={async () => {
        if (busy) return;
        setBusy(true);
        try {
          await refreshListingsCache();
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
      className="ml-0.5 inline align-baseline text-[11px] leading-none text-[#6b7280] hover:text-[#374151] disabled:opacity-40"
    >
      {busy ? "…" : "."}
    </button>
  );
}
