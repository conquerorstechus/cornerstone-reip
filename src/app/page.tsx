import Link from "next/link";
import { Kpi, SectionTitle } from "../components/Ui";
import { getKpis } from "../lib/data";
import { monthly, usd } from "../lib/format";

export default async function DashboardPage() {
  const kpis = await getKpis();

  return (
    <div className="space-y-8">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">GREATER TAMPA · LIVE BOOK</p>
        <h2 className="display mt-1 text-2xl font-semibold tracking-[0.04em] break-words sm:text-3xl">
          Intelligence for the next offer.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-taupe">
          Screen Greater Tampa homes the way High ROI Picks does — ask, offer, rent, taxes, HOA,
          insurance, and cash flow. Street addresses are sent on request.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Deals screened" value={String(kpis.dealsScreened)} hint="This week" accent="magenta" />
        <Kpi label="Avg cash flow" value={monthly(kpis.avgCashFlow)} hint="Before the mortgage" accent="blue" />
        <Kpi label="Avg suggested offer" value={usd(kpis.avgOffer)} hint="50% down" />
        <Kpi label="Submarkets" value={String(kpis.markets)} hint="Greater Tampa" accent="taupe" />
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/reports" className="bg-cream p-5 ring-1 ring-line hover:ring-blue">
          <SectionTitle kicker="DIGEST" title="Sam's High ROI Picks" />
          <p className="text-sm text-taupe">This week’s ranked cash-flow list. Request the address when you’re ready to tour.</p>
        </Link>
        <Link href="/areas" className="bg-cream p-5 ring-1 ring-line hover:ring-blue">
          <SectionTitle kicker="MARKETS" title="Greater Tampa areas" />
          <p className="text-sm text-taupe">Submarket scores, rents, and jobs — open a city to see what’s on the digest.</p>
        </Link>
      </section>
    </div>
  );
}
