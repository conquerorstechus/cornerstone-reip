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
          Screen Greater Tampa deals the way High ROI Picks does. Street addresses are sent to your
          email and phone on request — not posted publicly.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Deals in list"
          value={String(kpis.totalInJson)}
          hint={`${kpis.digestCount} homes · ${kpis.landCount} land`}
          accent="magenta"
        />
        <Kpi label="Avg cash flow" value={monthly(kpis.avgCashFlow)} hint="Before the mortgage" accent="blue" />
        <Kpi label="Avg suggested offer" value={usd(kpis.avgOffer)} hint="Homes in this week’s book" />
        <Kpi label="Submarkets" value={String(kpis.markets)} hint="Greater Tampa" accent="taupe" />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/picks/condos" className="bg-cream p-5 ring-1 ring-line hover:ring-blue">
          <SectionTitle kicker="CONDOS" title="Condos" />
          <p className="mt-1 text-2xl font-semibold text-ink">{kpis.condoCount}</p>
          <p className="text-sm text-taupe">deals this week</p>
        </Link>
        <Link href="/picks/townhomes" className="bg-cream p-5 ring-1 ring-line hover:ring-blue">
          <SectionTitle kicker="TOWNHOMES" title="Townhomes" />
          <p className="mt-1 text-2xl font-semibold text-ink">{kpis.townhomeCount}</p>
          <p className="text-sm text-taupe">deals this week</p>
        </Link>
        <Link href="/picks/sfh" className="bg-cream p-5 ring-1 ring-line hover:ring-blue">
          <SectionTitle kicker="SFH" title="Single family" />
          <p className="mt-1 text-2xl font-semibold text-ink">{kpis.sfhCount}</p>
          <p className="text-sm text-taupe">deals this week</p>
        </Link>
        <Link href="/land" className="bg-cream p-5 ring-1 ring-line hover:ring-blue">
          <SectionTitle kicker="LOTS" title="Land" />
          <p className="mt-1 text-2xl font-semibold text-ink">{kpis.landCount}</p>
          <p className="text-sm text-taupe">lots this week</p>
        </Link>
      </section>
    </div>
  );
}
