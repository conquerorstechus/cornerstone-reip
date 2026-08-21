import Link from "next/link";
import type { Property } from "../lib/types";
import { monthly, usd } from "../lib/format";

export function DealCard({ deal, compact }: { deal: Property; compact?: boolean }) {
  return (
    <Link
      href={`/properties/${deal.id}`}
      className="group block bg-cream ring-1 ring-line transition hover:ring-blue"
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          {deal.rank ? (
            <p className="display text-[10px] tracking-[0.24em] text-magenta">RANK #{deal.rank}</p>
          ) : null}
          <h3 className="display mt-1 text-base font-semibold tracking-wide">{deal.address}</h3>
          <p className="text-sm text-taupe">
            {deal.city}, {deal.state} {deal.zip}
          </p>
        </div>
        <div className="text-right">
          <p className="display text-[10px] tracking-[0.2em] text-taupe">CASH FLOW</p>
          <p className="font-display text-xl font-semibold text-blue">{monthly(deal.cashFlow)}</p>
        </div>
      </div>
      {!compact ? (
        <p className="px-5 py-3 text-sm leading-relaxed text-ink/80">{deal.description}</p>
      ) : null}
      <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        <Stat label="Ask" value={usd(deal.ask)} />
        <Stat label="Offer" value={usd(deal.offer)} />
        <Stat label="Rent" value={monthly(deal.rent)} />
        <Stat label="Mortgage*" value={monthly(deal.mortgageMonthly)} />
        <Stat label="Tax" value={monthly(deal.taxMonthly)} />
        <Stat label="HOA" value={monthly(deal.hoaMonthly)} />
        <Stat label="Beds / Baths" value={`${deal.beds} / ${deal.baths}`} />
        <Stat label="Sqft" value={deal.sqft.toLocaleString()} />
      </dl>
      <div className="flex flex-wrap gap-2 px-5 py-3">
        {deal.tags.map((t) => (
          <span key={t} className="bg-stone px-2 py-0.5 text-[11px] tracking-wide text-navy">
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream px-4 py-3">
      <dt className="display text-[9px] tracking-[0.18em] text-taupe">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold">{value}</dd>
    </div>
  );
}
