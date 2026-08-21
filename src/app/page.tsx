import Link from "next/link";
import { DealCard } from "../components/DealCard";
import { Kpi, SectionTitle } from "../components/Ui";
import { AREAS, DIGEST, KPIS, MULTIFAMILY } from "../lib/data";
import { monthly, usd } from "../lib/format";

export default function DashboardPage() {
  const top = DIGEST.deals.slice(0, 4);
  return (
    <div className="space-y-8">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">TAMPA BAY · LIVE BOOK</p>
        <h2 className="display mt-1 text-3xl font-semibold tracking-[0.04em]">
          Intelligence for the next offer.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-taupe">
          REIP screens areas, homes, land, and apartments the same way High ROI Picks does — ask,
          offer, rent, taxes, HOA, insurance, and cash flow on one page.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Deals screened" value={String(KPIS.dealsScreened)} hint="This week" accent="magenta" />
        <Kpi label="Avg cash flow" value={monthly(KPIS.avgCashFlow)} hint="Before the mortgage" accent="blue" />
        <Kpi label="Avg suggested offer" value={usd(KPIS.avgOffer)} hint="50% down" />
        <Kpi label="Submarkets" value={String(KPIS.markets)} hint="Tampa Bay book" accent="taupe" />
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <SectionTitle kicker="DIGEST" title={DIGEST.title} />
          <Link href="/reports" className="text-sm text-blue hover:underline">
            Open full report
          </Link>
        </div>
        <p className="mb-4 text-sm text-taupe">
          {DIGEST.date} · {DIGEST.intro}
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {top.map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-cream ring-1 ring-line">
          <div className="border-b border-line px-5 py-4">
            <SectionTitle kicker="MARKETS" title="Tampa Bay submarkets" />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="display text-left text-[10px] tracking-[0.16em] text-taupe">
                <th className="px-5 py-2">Area</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Median ask</th>
                <th className="px-3 py-2">Median CF</th>
                <th className="px-3 py-2">YoY</th>
              </tr>
            </thead>
            <tbody>
              {AREAS.map((a) => (
                <tr key={a.slug} className="border-t border-stone">
                  <td className="px-5 py-2.5">
                    <Link href={`/areas/${a.slug}`} className="font-semibold hover:text-blue">
                      {a.name}
                    </Link>
                    <span className="ml-2 text-taupe">{a.county}</span>
                  </td>
                  <td className="px-3 py-2.5 font-semibold">{a.investorScore}</td>
                  <td className="px-3 py-2.5">{usd(a.medianAsk)}</td>
                  <td className="px-3 py-2.5 text-blue">{monthly(a.medianCf)}</td>
                  <td className="px-3 py-2.5">{a.yoyPrice.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-navy p-6 text-cream">
          <p className="display text-[10px] tracking-[0.24em] text-taupe-2">MULTIFAMILY</p>
          <h3 className="display mt-2 text-lg font-semibold">On the book</h3>
          <ul className="mt-4 space-y-4">
            {MULTIFAMILY.map((m) => (
              <li key={m.id}>
                <Link href={`/multifamily/${m.id}`} className="block hover:text-magenta">
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-taupe-2">
                    {m.units} units · {m.capRate.toFixed(2)}% cap · {usd(m.pricePerUnit)}/door
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/analyze"
            className="mt-6 inline-block bg-magenta px-4 py-2 text-sm font-semibold text-white"
          >
            Analyze an address
          </Link>
        </div>
      </section>
    </div>
  );
}
