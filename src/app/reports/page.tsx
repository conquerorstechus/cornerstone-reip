import { DealCard } from "../../components/DealCard";
import { DIGEST } from "../../lib/data";

export const metadata = { title: "High ROI Picks" };

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">DIGEST</p>
        <h2 className="display mt-1 text-2xl font-semibold break-words sm:text-3xl">{DIGEST.title}</h2>
        <p className="mt-1 text-sm text-taupe">
          {DIGEST.date} · {DIGEST.source}
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed">{DIGEST.intro}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {DIGEST.deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>

      <p className="text-xs text-taupe">
        Mortgage estimated at 7% fixed, 30 years, 50% down. All figures are estimates. Street
        addresses are withheld until you request more info.
      </p>
    </div>
  );
}
