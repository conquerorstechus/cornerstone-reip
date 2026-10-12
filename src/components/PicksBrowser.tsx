"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LandCard } from "./LandCard";
import { PicksList } from "./PicksList";
import { PICKS_META, type DealView, type PicksKind } from "../lib/picks";
import type { LandParcel, Property } from "../lib/types";

const ORDER: DealView[] = ["condos", "townhomes", "sfh", "land"];

const SHORT: Record<DealView, string> = {
  condos: "Condos",
  townhomes: "Townhomes",
  sfh: "Single Family",
  land: "Land",
};

const LAND_ACCENT = "#0d9488";

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
    const href = next === "condos" ? "/" : `/?view=${next}`;
    router.replace(href, { scroll: false });
  }

  function count(id: DealView) {
    return id === "land" ? (land?.length ?? 0) : (groups[id]?.length ?? 0);
  }

  function accent(id: DealView) {
    return id === "land" ? LAND_ACCENT : PICKS_META[id].accent;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="sticky top-[calc(max(0.75rem,env(safe-area-inset-top))+3.5rem)] z-20 -mx-4 bg-paper/95 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ORDER.map((id) => {
          const selected = id === kind;
          return (
            <button
              key={id}
              type="button"
              onClick={() => select(id)}
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold ${
                selected ? "text-white" : "bg-white text-[#374151] ring-1 ring-[#e5e7eb]"
              }`}
              style={selected ? { backgroundColor: accent(id) } : undefined}
            >
              {SHORT[id]}
              <span className={selected ? "text-white/80" : "text-[#6b7280]"}>
                {" "}
                {count(id)}
              </span>
            </button>
          );
        })}
        </div>
      </div>
      {kind === "land" ? (
        <LandList parcels={land} />
      ) : (
        <PicksList kind={kind} deals={groups[kind]} dateLabel={dateLabel} />
      )}
    </div>
  );
}

function LandList({ parcels }: { parcels: LandParcel[] }) {
  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 flex overflow-hidden rounded-lg bg-[#f0fdfa]">
          <div className="w-1.5 shrink-0 bg-[#0d9488]" />
          <h2 className="px-4 py-3 text-xl font-extrabold tracking-tight text-[#0d9488] sm:text-2xl">
            Land for Sale
          </h2>
        </div>
        <p className="text-[13px] text-[#6b7280]">
          {parcels.length} lots · Address sent when you leave email and phone
        </p>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#374151]">
          Lots and acreage from Sam&apos;s High ROI land screen. Tap{" "}
          <strong>Send me the address</strong> and we deliver it right away.
        </p>
      </div>
      <div className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3.5 text-[13px] leading-relaxed text-[#1e3a5f]">
        Call/text <strong>908-922-1063</strong> if you want to talk through a lot before requesting
        the address.
      </div>
      <div className="space-y-5">
        {parcels.map((parcel) => (
          <LandCard key={parcel.id} parcel={parcel} />
        ))}
      </div>
      {!parcels.length ? <p className="text-sm text-[#6b7280]">No lots this week.</p> : null}
    </div>
  );
}
