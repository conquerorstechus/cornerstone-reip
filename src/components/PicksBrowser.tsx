"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LandCard } from "./LandCard";
import { ListHeader, PicksList } from "./PicksList";
import { LAND_ACCENT, PICKS_META, type DealView, type PicksKind } from "../lib/picks";
import type { LandParcel, Property } from "../lib/types";

const ORDER: DealView[] = ["condos", "townhomes", "sfh", "land"];

const SHORT: Record<DealView, string> = {
  condos: "Condos",
  townhomes: "Townhomes",
  sfh: "Single family",
  land: "Land",
};

export function PicksBrowser({
  groups,
  land,
  dateLabel,
  initial,
}: {
  groups: Record<PicksKind, Property[]>;
  land: LandParcel[];
  dateLabel: string;
  initial: DealView;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<DealView>(initial);

  function select(next: DealView) {
    setKind(next);
    router.replace(next === "condos" ? "/" : `/?view=${next}`, { scroll: false });
  }

  const count = (id: DealView) => (id === "land" ? (land?.length ?? 0) : (groups[id]?.length ?? 0));
  const accent = (id: DealView) => (id === "land" ? LAND_ACCENT : PICKS_META[id].accent);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="sticky top-[calc(max(0.75rem,env(safe-area-inset-top))+3.5rem)] z-20 -mx-4 bg-paper/95 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <div
          role="tablist"
          className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {ORDER.map((id) => {
            const selected = id === kind;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => select(id)}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                  selected
                    ? "bg-navy text-white"
                    : "bg-white text-taupe ring-1 ring-line rounded-xl hover:text-navy"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: accent(id) }}
                  aria-hidden
                />
                {SHORT[id]}
                <span className={selected ? "text-white/60" : "text-taupe-2"}>{count(id)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {kind === "land" ? (
        <section className="space-y-4">
          <ListHeader title="Land for sale" count={land.length} unit="lots" sub={dateLabel} />
          <div className="space-y-4">
            {land.map((parcel) => (
              <LandCard key={parcel.id} parcel={parcel} />
            ))}
          </div>
          {!land.length ? <p className="text-sm text-taupe">No lots this week.</p> : null}
        </section>
      ) : (
        <PicksList kind={kind} deals={groups[kind]} dateLabel={dateLabel} />
      )}
    </div>
  );
}
