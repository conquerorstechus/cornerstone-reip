import { DealCard } from "./DealCard";
import { DisclaimerNote } from "./Disclaimer";
import type { Property } from "../lib/types";
import type { PicksKind } from "../lib/picks";
import { PICKS_META } from "../lib/picks";

export function PicksList({
  kind,
  deals,
  dateLabel,
}: {
  kind: PicksKind;
  deals: Property[];
  dateLabel: string;
}) {
  const meta = PICKS_META[kind];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <div className={`mb-3 flex overflow-hidden rounded-lg ${meta.soft}`}>
          <div className="w-1.5 shrink-0" style={{ backgroundColor: meta.accent }} />
          <h2
            className="px-4 py-3 text-xl font-extrabold tracking-tight sm:text-2xl"
            style={{ color: meta.accent }}
          >
            {meta.title}
          </h2>
        </div>
        <p className="text-[13px] text-[#6b7280]">
          {deals.length} deals · {dateLabel}
        </p>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#374151]">{meta.blurb}</p>
      </div>

      <div className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3.5 text-[13px] leading-relaxed text-[#1e3a5f]">
        Want the address now? Tap <strong>Send me the address</strong> on any deal — we email and
        text it to you right away. Or call/text <strong>908-922-1063</strong>.
      </div>

      <div className="space-y-5">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>

      {!deals.length ? (
        <p className="text-sm text-[#6b7280]">No deals in this category this week.</p>
      ) : null}

      <DisclaimerNote />

      <p className="text-xs text-[#6b7280]">
        Mortgage estimated at 7% fixed, 30 years, 50% down unless you change the slider on a deal
        page. Street addresses are sent only after you leave email and phone.
      </p>
    </div>
  );
}
