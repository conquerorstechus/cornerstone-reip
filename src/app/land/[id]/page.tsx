import Link from "next/link";
import { notFound } from "next/navigation";
import { GetMoreInfoButton } from "../../../components/GetMoreInfoButton";
import { InvestmentModels } from "../../../components/InvestmentModels";
import { OsmMap } from "../../../components/OsmMap";
import { ScoreBar, SectionTitle, TableScroll } from "../../../components/Ui";
import { getAppreciationProfile } from "../../../lib/appreciation";
import { areaBySlug, landById } from "../../../lib/data";
import { monthly, pct, usd } from "../../../lib/format";

export default async function LandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const l = await landById(id);
  if (!l) notFound();
  const area = areaBySlug(l.areaSlug);
  const profile = getAppreciationProfile("land");
  const cf = l.cashFlow ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link href="/land" className="text-[13px] font-medium text-[#1d4ed8] hover:underline">
          ← Back to Land
        </Link>
      </div>

      <article className="overflow-hidden rounded-lg border border-[#e5e7eb] border-l-4 border-l-[#0d9488] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="bg-[#0d9488] px-4 py-3 text-white sm:px-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px]">
            <span className="font-bold">{l.rank ? `Rank #${l.rank}` : "Lot"}</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
              Land
            </span>
            <span className="ml-auto font-medium">
              Cash Flow: <strong>{monthly(cf)}</strong>
            </span>
          </div>
          <h1 className="mt-2 text-xl font-bold sm:text-2xl">
            {l.city}, FL {l.zip}
          </h1>
          <p className="mt-1 text-[13px] text-white/85">
            Address on request
            {area ? (
              <>
                {" · "}
                <Link href={`/areas/${area.slug}`} className="underline hover:text-white">
                  {area.name}
                </Link>
              </>
            ) : null}
          </p>
        </div>

        <div className="space-y-4 bg-[#f0fdfa] px-4 py-5 sm:px-5">
          <div className="w-full max-w-xs">
            <ScoreBar score={l.investorScore} />
          </div>
          {l.thesis ? (
            <p className="text-[14px] leading-relaxed text-[#4b5563]">{l.thesis}</p>
          ) : null}

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-[#e5e7eb] ring-1 ring-[#e5e7eb] sm:grid-cols-4">
            {[
              ["Asking", usd(l.asking)],
              ["Offer", usd(l.offer ?? l.asking)],
              ["$/acre", usd(l.pricePerAcre)],
              ["Acres", l.acres.toFixed(2)],
              ["Buildable", `${l.buildableSf.toLocaleString()} sf`],
              ["Max units", String(l.maxUnits)],
              ["Zoning", l.zoning],
              ["Flood", l.floodZone],
              ["Tax", monthly(l.taxMonthly ?? 0)],
              ["HOA", monthly(l.hoaMonthly ?? 0)],
              ["Insurance", monthly(l.insuranceMonthly ?? 0)],
              ["Mortgage*", monthly(l.mortgageMonthly ?? 0)],
            ].map(([k, v]) => (
              <div key={k} className="bg-white px-3 py-2.5">
                <dt className="text-[10px] font-semibold tracking-wide text-[#6b7280] uppercase">
                  {k}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-[#1e3a5f]">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[11px] text-[#6b7280]">
            * Mortgage estimated at 7% fixed, 30 years, 50% down. Land typically has little or no
            rent — CoC will often be negative until you entitle or sell.
          </p>

          <GetMoreInfoButton dealId={l.id} dealType="land" />
        </div>
      </article>

      <InvestmentModels
        accent="#0d9488"
        profile={profile}
        financials={{
          purchasePrice: l.offer ?? l.asking,
          rentMonthly: 0,
          taxMonthly: l.taxMonthly ?? 0,
          hoaMonthly: l.hoaMonthly ?? 0,
          insuranceMonthly: l.insuranceMonthly ?? 0,
        }}
      />

      {l.scenarios.length ? (
        <section>
          <SectionTitle kicker="EXITS" title="Development scenarios" />
          <TableScroll>
            <table className="w-full min-w-[36rem] bg-cream text-sm ring-1 ring-line">
              <thead>
                <tr className="display text-left text-[10px] tracking-[0.16em] text-taupe">
                  <th className="px-4 py-2">Scenario</th>
                  <th className="px-4 py-2">Units</th>
                  <th className="px-4 py-2">Cost</th>
                  <th className="px-4 py-2">Exit</th>
                  <th className="px-4 py-2">Profit</th>
                  <th className="px-4 py-2">ROI</th>
                </tr>
              </thead>
              <tbody>
                {l.scenarios.map((s) => (
                  <tr key={s.name} className="border-t border-stone">
                    <td className="px-4 py-2 font-semibold">{s.name}</td>
                    <td className="px-4 py-2">{s.units || "—"}</td>
                    <td className="px-4 py-2">{usd(s.cost)}</td>
                    <td className="px-4 py-2">{usd(s.exitValue)}</td>
                    <td className="px-4 py-2">{usd(s.profit)}</td>
                    <td className="px-4 py-2 text-blue">{pct(s.roi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        </section>
      ) : null}

      <OsmMap lat={l.lat} lng={l.lng} label={`${l.city} · Greater Tampa`} />
    </div>
  );
}
