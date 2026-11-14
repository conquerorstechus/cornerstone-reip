import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GetMoreInfoButton } from "../../../components/GetMoreInfoButton";
import { InvestmentModels } from "../../../components/InvestmentModels";
import { OsmMap } from "../../../components/OsmMap";
import { SectionTitle, TableScroll } from "../../../components/Ui";
import { getAppreciationProfile } from "../../../lib/appreciation";
import { areaBySlug, landById } from "../../../lib/data";
import { monthly, pct, usd } from "../../../lib/format";

function lotLabel(acres: number, lotSqft?: number) {
  if (acres > 0) return `${acres.toFixed(2)} acres`;
  if (lotSqft) return `${lotSqft.toLocaleString()} sqft`;
  return "Lot";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const parcel = await landById(id);
  if (!parcel) return {};

  const headline = `${lotLabel(parcel.acres, parcel.lotSqft)} · ${parcel.city}`;
  const description = `Land in ${parcel.city}, FL ${parcel.zip}. Asking ${usd(parcel.asking)}. Estimated cash flow ${monthly(parcel.cashFlow ?? 0)}. Address on request.`;

  return {
    title: headline,
    description,
    openGraph: {
      title: `${headline} · Land · REIP`,
      description,
      url: `/land/${parcel.id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${headline} · Land · REIP`,
      description,
    },
  };
}

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
      <Link href="/?view=land" className="inline-block text-sm font-semibold text-blue hover:underline">
        ← Back to land
      </Link>

      <article className="card space-y-5 p-4 sm:p-6">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="eyebrow inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-navy" aria-hidden />
              Land
            </span>
            {l.rank ? <span className="eyebrow">#{l.rank}</span> : null}
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-navy sm:text-3xl">
            {lotLabel(l.acres, l.lotSqft)}
          </h1>
          <p className="mt-1 text-sm text-taupe">
            {l.city}, FL {l.zip}
            {area ? (
              <>
                {" · "}
                <Link href={`/areas/${area.slug}`} className="font-semibold text-blue hover:underline">
                  {area.name}
                </Link>
              </>
            ) : null}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Asking", usd(l.asking)],
            ["Per acre", usd(l.pricePerAcre)],
            ["Max units", String(l.maxUnits)],
            ["Cash flow", monthly(cf)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-paper px-3 py-3">
              <dt className="eyebrow">{k}</dt>
              <dd
                className={`mt-1 font-display text-lg font-semibold tabular-nums ${
                  k === "Cash flow" ? (cf >= 0 ? "text-success" : "text-danger") : "text-navy"
                }`}
              >
                {v}
              </dd>
            </div>
          ))}
        </dl>

        <p className="text-sm text-taupe">
          Zoning {l.zoning} · Flood {l.floodZone} · Tax {monthly(l.taxMonthly ?? 0)} · Mortgage{" "}
          {monthly(l.mortgageMonthly ?? 0)} at 50% down. Land rarely rents, so cash-on-cash is often
          negative until you entitle or sell.
        </p>

        {l.thesis ? <p className="text-sm leading-relaxed text-ink/80">{l.thesis}</p> : null}

        <GetMoreInfoButton dealId={l.id} dealType="land" className="w-full sm:w-auto" />
      </article>

      <InvestmentModels
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
            <table className="w-full min-w-[36rem] bg-cream text-sm ring-1 ring-line rounded-xl">
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
