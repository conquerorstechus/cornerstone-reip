import Link from "next/link";
import { notFound } from "next/navigation";
import { DealCard } from "../../../components/DealCard";
import { OsmMap } from "../../../components/OsmMap";
import { ScoreBar, SectionTitle } from "../../../components/Ui";
import { AnalyzeForm } from "../../../components/AnalyzeForm";
import { areaBySlug, LAND, MULTIFAMILY, PROPERTIES } from "../../../lib/data";
import { monthly, pct, usd } from "../../../lib/format";

export default async function AreaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = areaBySlug(slug);
  if (!a) notFound();
  const deals = PROPERTIES.filter((p) => p.areaSlug === slug);
  const land = LAND.filter((l) => l.areaSlug === slug);
  const mf = MULTIFAMILY.filter((m) => m.areaSlug === slug);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="display text-[11px] tracking-[0.28em] text-magenta">{a.county.toUpperCase()} COUNTY</p>
          <h2 className="display mt-1 text-3xl font-semibold">{a.name}</h2>
          <p className="text-sm text-taupe">{a.zips.join(" · ")}</p>
        </div>
        <div className="w-56">
          <ScoreBar score={a.investorScore} />
        </div>
      </div>
      <p className="max-w-3xl text-sm leading-relaxed">{a.thesis}</p>

      <dl className="grid grid-cols-2 gap-px bg-line ring-1 ring-line sm:grid-cols-4">
        {[
          ["Median ask", usd(a.medianAsk)],
          ["Median rent", monthly(a.medianRent)],
          ["Median CF", monthly(a.medianCf)],
          ["YoY price", pct(a.yoyPrice)],
          ["YoY rent", pct(a.yoyRent)],
          ["Vacancy", pct(a.vacancy)],
          ["Job growth", pct(a.jobGrowth)],
          ["Population", a.population.toLocaleString()],
          ["Med. HH income", usd(a.medianHhIncome)],
          ["Flood", a.floodRisk],
          ["Schools", `${a.schoolScore}/10`],
          ["Commute", `${a.commuteMin} min`],
        ].map(([k, v]) => (
          <div key={k} className="bg-cream px-4 py-3">
            <dt className="display text-[9px] tracking-[0.16em] text-taupe">{k}</dt>
            <dd className="mt-1 text-sm font-semibold capitalize">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <OsmMap lat={a.lat} lng={a.lng} zoom={12} label={a.name} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-cream p-5 ring-1 ring-line">
            <h3 className="display text-sm font-semibold tracking-[0.08em]">Catalysts</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {a.catalysts.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-blue" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-cream p-5 ring-1 ring-line">
            <h3 className="display text-sm font-semibold tracking-[0.08em]">Risks</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {a.risks.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-magenta" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {deals.length ? (
        <section>
          <SectionTitle kicker="ON THE DIGEST" title="Properties in this area" />
          <div className="grid gap-4 lg:grid-cols-2">
            {deals.map((d) => (
              <DealCard key={d.id} deal={d} compact />
            ))}
          </div>
        </section>
      ) : null}

      {land.length || mf.length ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {land.map((l) => (
            <Link key={l.id} href={`/land/${l.id}`} className="bg-cream p-4 ring-1 ring-line hover:ring-blue">
              <p className="display text-[10px] tracking-[0.2em] text-taupe">LAND</p>
              <p className="mt-1 font-semibold">{l.address}</p>
              <p className="text-sm text-taupe">
                {l.acres} ac · {usd(l.asking)}
              </p>
            </Link>
          ))}
          {mf.map((m) => (
            <Link key={m.id} href={`/multifamily/${m.id}`} className="bg-cream p-4 ring-1 ring-line hover:ring-blue">
              <p className="display text-[10px] tracking-[0.2em] text-taupe">MULTIFAMILY</p>
              <p className="mt-1 font-semibold">{m.name}</p>
              <p className="text-sm text-taupe">
                {m.units} units · {m.capRate.toFixed(2)}% cap
              </p>
            </Link>
          ))}
        </section>
      ) : null}

      <AnalyzeForm defaultType="area" defaultQuery={`${a.name}, FL`} />
    </div>
  );
}
