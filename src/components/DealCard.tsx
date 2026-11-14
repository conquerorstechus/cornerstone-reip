import Link from "next/link";
import { GetMoreInfoButton } from "./GetMoreInfoButton";
import { cashDownYearlyRor, monthly, pct, usd } from "../lib/format";
import { KIND_STYLE } from "../lib/picks";
import type { Property } from "../lib/types";

export function DealCard({ deal }: { deal: Property; compact?: boolean }) {
  const kind = deal.homeKind ?? "sfh";
  const style = KIND_STYLE[kind];
  const purchase = deal.offer || deal.ask;
  const yearlyRor = cashDownYearlyRor({ cashFlowMonthly: deal.cashFlow, purchasePrice: purchase });
  const modelsHref = `/properties/${encodeURIComponent(deal.id)}`;

  return (
    <article className="card overflow-hidden">
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow inline-flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: style.accent }}
              aria-hidden
            />
            {style.label}
          </span>
          {deal.rank ? <span className="eyebrow">#{deal.rank}</span> : null}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-navy sm:text-xl">
            {deal.beds} bd · {deal.baths} ba · {deal.sqft.toLocaleString()} sqft
          </h3>
          <p className="mt-0.5 text-sm text-taupe">
            {deal.city}, {deal.state} {deal.zip}
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-3 rounded-xl bg-paper px-4 py-3">
          <Stat label="Price" value={usd(purchase)} />
          <Stat
            label="Cash flow"
            value={monthly(deal.cashFlow)}
            tone={deal.cashFlow >= 0 ? "good" : "bad"}
          />
          <Stat label="Yearly ROR" value={pct(yearlyRor * 100, 1)} tone={yearlyRor >= 0 ? "good" : "bad"} />
        </dl>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={modelsHref} className="btn btn-secondary flex-1">
            See the models
          </Link>
          <GetMoreInfoButton dealId={deal.id} dealType="property" className="flex-1" />
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow">{label}</dt>
      <dd
        className={`mt-1 truncate font-display text-base font-semibold tabular-nums sm:text-lg ${
          tone === "good" ? "text-success" : tone === "bad" ? "text-danger" : "text-navy"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
