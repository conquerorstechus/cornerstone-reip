"use client";

import { ChevronDown } from "lucide-react";
import { DEFAULT_MARKET_ID, MARKETS } from "../lib/markets";

export function MarketSelect() {
  return (
    <label className="relative block min-w-0 shrink">
      <span className="sr-only">Market</span>
      <select
        defaultValue={DEFAULT_MARKET_ID}
        className="display h-11 max-w-[9.5rem] appearance-none truncate border border-line bg-cream py-2 pl-3 pr-9 text-sm tracking-wide text-navy outline-none focus:border-blue sm:max-w-none sm:min-w-[11.5rem]"
        aria-label="Market"
      >
        {MARKETS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        strokeWidth={1.75}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-taupe"
        aria-hidden
      />
    </label>
  );
}
