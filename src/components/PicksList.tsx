import { DealCard } from "./DealCard";
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
    <section className="space-y-4">
      <ListHeader title={meta.title} count={deals.length} unit="deals" sub={dateLabel} />
      <div className="space-y-4">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>
      {!deals.length ? <p className="text-sm text-taupe">No deals in this category this week.</p> : null}
      <p className="text-xs text-taupe">
        Mortgage modeled at 7%, 30 years, 50% down. Street address is sent when you ask for it.
      </p>
    </section>
  );
}

export function ListHeader({
  title,
  count,
  unit,
  sub,
}: {
  title: string;
  count: number;
  unit: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 className="text-2xl font-semibold text-navy">{title}</h2>
      <p className="text-sm text-taupe">
        {count} {unit}
        {sub ? ` · ${sub}` : ""}
      </p>
    </div>
  );
}
