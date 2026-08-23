import { GetMoreInfoButton } from "./GetMoreInfoButton";
import type { Property } from "../lib/types";
import { listingHeadline, monthly, usd } from "../lib/format";

export function DealCard({ deal, compact }: { deal: Property; compact?: boolean }) {
  const tags = deal.tags.filter((t) => t.toLowerCase() !== deal.city.toLowerCase());

  return (
    <article className="bg-cream ring-1 ring-line">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5">
        <div className="min-w-0">
          {deal.rank ? (
            <p className="display text-[10px] tracking-[0.24em] text-magenta">RANK #{deal.rank}</p>
          ) : null}
          <h3 className="display mt-1 text-base font-semibold tracking-wide break-words">
            {listingHeadline(deal)}
          </h3>
          <p className="text-sm text-taupe">Greater Tampa · Address on request</p>
        </div>
        <div className="text-left sm:shrink-0 sm:text-right">
          <p className="display text-[10px] tracking-[0.2em] text-taupe">CASH FLOW</p>
          <p className="font-display text-xl font-semibold text-blue">{monthly(deal.cashFlow)}</p>
        </div>
      </div>
      {!compact ? (
        <p className="px-4 py-3 text-sm leading-relaxed text-ink/80 sm:px-5">{deal.description}</p>
      ) : null}
      <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        <Stat label="Ask" value={usd(deal.ask)} />
        <Stat label="Offer" value={usd(deal.offer)} />
        <Stat label="Rent" value={monthly(deal.rent)} />
        <Stat label="Mortgage*" value={monthly(deal.mortgageMonthly)} />
        <Stat label="Tax" value={monthly(deal.taxMonthly)} />
        <Stat label="HOA" value={monthly(deal.hoaMonthly)} />
        <Stat label="Sqft" value={deal.sqft.toLocaleString()} />
      </dl>
      {tags.length ? (
        <div className="flex flex-wrap gap-2 px-4 py-3 sm:px-5">
          {tags.map((t) => (
            <span key={t} className="bg-stone px-2 py-0.5 text-[11px] tracking-wide text-navy">
              {t}
            </span>
          ))}
        </div>
      ) : null}
      <div className="border-t border-line px-4 py-3 sm:px-5">
        <GetMoreInfoButton dealId={deal.id} />
      </div>
    </article>
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
