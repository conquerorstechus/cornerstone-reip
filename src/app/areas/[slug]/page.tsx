import Link from "next/link";
import { notFound } from "next/navigation";
import { DealCard } from "../../../components/DealCard";
import { OsmMap } from "../../../components/OsmMap";
import { ScoreBar, SectionTitle } from "../../../components/Ui";
import { areaBySlug, getLand, getProperties, MULTIFAMILY } from "../../../lib/data";
import { monthly, pct, usd } from "../../../lib/format";

export default async function AreaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = areaBySlug(slug);
  if (!a) notFound();
  const [allDeals, allLand] = await Promise.all([getProperties(), getLand()]);
  const deals = allDeals.filter((p) => p.areaSlug === slug);
  const sfh = deals.filter((d) => (d.homeKind ?? "sfh") === "sfh");
  const condo = deals.filter((d) => d.homeKind === "condo");
  const townhome = deals.filter((d) => d.homeKind === "townhouse");
  const land = allLand.filter((l) => l.areaSlug === slug);
  const mf = MULTIFAMILY.filter((m) => m.areaSlug === slug);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="display text-[11px] tracking-[0.28em] text-magenta">{a.county.toUpperCase()} COUNTY</p>
          <h2 className="display mt-1 text-2xl font-semibold break-words sm:text-3xl">{a.name}</h2>
          <p className="text-sm text-taupe">{a.zips.join(" · ")}</p>
        </div>
        <div className="w-full sm:w-56">
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

      {sfh.length ? (
        <section>
          <SectionTitle kicker="SINGLE FAMILY" title="Single-family in this area" />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {sfh.map((d) => (
              <DealCard key={d.id} deal={d} compact />
            ))}
          </div>
        </section>
      ) : null}

      {condo.length ? (
        <section>
          <SectionTitle kicker="CONDOS" title="Condos in this area" />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {condo.map((d) => (
              <DealCard key={d.id} deal={d} compact />
            ))}
          </div>
        </section>
      ) : null}

      {townhome.length ? (
        <section>
          <SectionTitle kicker="TOWNHOMES" title="Townhomes in this area" />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {townhome.map((d) => (
              <DealCard key={d.id} deal={d} compact />
            ))}
          </div>
        </section>
      ) : null}

      {land.length || mf.length ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {land.map((l) => (
            <Link
              key={l.id}
              href={`/land/${l.id}`}
              className="bg-cream p-4 ring-1 ring-line hover:ring-blue"
            >
              <p className="display text-[10px] tracking-[0.2em] text-taupe">LAND</p>
              <p className="mt-1 font-semibold">
                {l.city}, FL {l.zip}
              </p>
              <p className="text-sm text-taupe">
                {l.acres} ac · {usd(l.asking)} · Address on request
              </p>
            </Link>
          ))}
          {mf.map((m) => (
            <div
              key={m.id}
              className="relative bg-cream p-4 ring-1 ring-line"
              aria-disabled="true"
            >
              <div className="pointer-events-none select-none opacity-40 grayscale" aria-hidden>
                <p className="display text-[10px] tracking-[0.2em] text-taupe">MULTIFAMILY</p>
                <p className="mt-1 font-semibold">{m.name}</p>
                <p className="text-sm text-taupe">
                  {m.units} units · {m.capRate.toFixed(2)}% cap
                </p>
              </div>
              <p className="display absolute right-3 top-3 text-[9px] tracking-[0.16em] text-taupe">
                SOON
              </p>
            </div>
          ))}
        </section>
      ) : null}

      <Link
        href={`/analyze?type=area&q=${encodeURIComponent(`${a.name}, FL`)}`}
        className="inline-flex min-h-11 items-center bg-magenta px-4 py-2 text-sm font-semibold text-white hover:bg-magenta-dark"
      >
        Analyze this area
      </Link>
    </div>
  );
}
