import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GetMoreInfoButton } from "../../../components/GetMoreInfoButton";
import { InvestmentModels } from "../../../components/InvestmentModels";
import { OsmMap } from "../../../components/OsmMap";
import { assetClassFromHomeKind, getAppreciationProfile } from "../../../lib/appreciation";
import { areaBySlug, propertyById } from "../../../lib/data";
import { listingHeadline, monthly, usd } from "../../../lib/format";
import { KIND_STYLE, picksPathForHomeKind } from "../../../lib/picks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await propertyById(id);
  if (!p) return {};

  const kind = KIND_STYLE[p.homeKind ?? "sfh"]?.label ?? "Home";
  const headline = listingHeadline(p);
  const title = `${headline} · ${kind}`;
  const description = `${kind} in ${p.city}, ${p.state} ${p.zip}. Asking ${usd(p.ask)}. Estimated cash flow ${monthly(p.cashFlow)}. Address on request.`;

  return {
    title: headline,
    description,
    openGraph: {
      title: `${title} · REIP`,
      description,
      url: `/properties/${p.id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · REIP`,
      description,
    },
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await propertyById(id);
  if (!p) notFound();

  const area = areaBySlug(p.areaSlug);
  const kind = p.homeKind ?? "sfh";
  const style = KIND_STYLE[kind];
  const profile = getAppreciationProfile(assetClassFromHomeKind(kind));
  const carrying = p.taxMonthly + p.hoaMonthly + p.insuranceMonthly;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href={picksPathForHomeKind(kind)}
        className="inline-block text-sm font-semibold text-blue hover:underline"
      >
        ← Back to {style.plural.toLowerCase()}
      </Link>

      <article className="card space-y-5 p-4 sm:p-6">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="eyebrow inline-flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: style.accent }}
                aria-hidden
              />
              {style.label}
            </span>
            {p.rank ? <span className="eyebrow">#{p.rank}</span> : null}
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-navy sm:text-3xl">
            {p.beds} bd · {p.baths} ba · {p.sqft.toLocaleString()} sqft
          </h1>
          <p className="mt-1 text-sm text-taupe">
            {p.city}, {p.state} {p.zip}
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
            ["Price", usd(p.offer || p.ask), ""],
            ["Rent", p.rent > 0 ? monthly(p.rent) : "n/a", ""],
            ["Costs", monthly(carrying), "Tax, HOA, insurance"],
            ["Cash flow", monthly(p.cashFlow), p.cashFlow >= 0 ? "good" : "bad"],
          ].map(([k, v, t]) => (
            <div key={k} className="rounded-xl bg-paper px-3 py-3">
              <dt className="eyebrow">{k}</dt>
              <dd
                className={`mt-1 font-display text-lg font-semibold tabular-nums ${
                  t === "good" ? "text-success" : t === "bad" ? "text-danger" : "text-navy"
                }`}
              >
                {v}
              </dd>
              {t && t !== "good" && t !== "bad" ? (
                <p className="mt-0.5 text-[11px] text-taupe">{t}</p>
              ) : null}
            </div>
          ))}
        </dl>

        <p className="text-sm text-taupe">
          Asking {usd(p.ask)} · Built {p.yearBuilt}
          {p.lotSqft ? ` · ${p.lotSqft.toLocaleString()} sqft lot` : ""} · Mortgage{" "}
          {monthly(p.mortgageMonthly)} at 50% down
        </p>

        {p.description ? (
          <p className="text-sm leading-relaxed text-ink/80">{p.description}</p>
        ) : null}

        <GetMoreInfoButton dealId={p.id} dealType="property" className="w-full sm:w-auto" />
      </article>

      <InvestmentModels
        profile={profile}
        financials={{
          purchasePrice: p.offer || p.ask,
          rentMonthly: p.rent,
          taxMonthly: p.taxMonthly,
          hoaMonthly: p.hoaMonthly,
          insuranceMonthly: p.insuranceMonthly,
        }}
      />

      {area ? (
        <OsmMap lat={area.lat} lng={area.lng} zoom={12} label={`${area.name} · Greater Tampa`} />
      ) : null}
    </div>
  );
}
