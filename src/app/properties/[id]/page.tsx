import Link from "next/link";
import { notFound } from "next/navigation";
import { GetMoreInfoButton } from "../../../components/GetMoreInfoButton";
import { InvestmentModels } from "../../../components/InvestmentModels";
import { OsmMap } from "../../../components/OsmMap";
import { assetClassFromHomeKind, getAppreciationProfile } from "../../../lib/appreciation";
import { areaBySlug, propertyById } from "../../../lib/data";
import { listingHeadline, monthly, usd } from "../../../lib/format";
import { picksPathForHomeKind } from "../../../lib/picks";

const ACCENT: Record<string, string> = {
  sfh: "#1e40af",
  condo: "#7c3aed",
  townhouse: "#6d28d9",
};

const KIND_LABEL: Record<string, string> = {
  sfh: "Single Family Home",
  condo: "Condo",
  townhouse: "Townhome",
};

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
  const accent = ACCENT[kind] ?? ACCENT.sfh;
  const profile = getAppreciationProfile(assetClassFromHomeKind(kind));
  const baths = Number.isInteger(p.baths) ? String(p.baths) : String(p.baths);
  const afterDebt = p.cashFlow - p.mortgageMonthly;
  const cfPositive = p.cashFlow >= 0;
  const backHref = picksPathForHomeKind(kind);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link href={backHref} className="text-[13px] font-medium text-[#1d4ed8] hover:underline">
          ← Back to {KIND_LABEL[kind]}s
        </Link>
      </div>

      <article
        className="overflow-hidden rounded-lg border border-[#e5e7eb] border-l-4 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        style={{ borderLeftColor: accent }}
      >
        <div className="px-4 py-3 text-white sm:px-5" style={{ backgroundColor: accent }}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px]">
            <span className="font-bold">{p.rank ? `Rank #${p.rank}` : "Deal"}</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
              {KIND_LABEL[kind]}
            </span>
            <span className="ml-auto font-medium">
              Cash Flow:{" "}
              <strong className={cfPositive ? "" : "text-red-100"}>{monthly(p.cashFlow)}</strong>
            </span>
          </div>
          <h1 className="mt-2 text-xl font-bold sm:text-2xl">{listingHeadline(p)}</h1>
          <p className="mt-1 text-[13px] text-white/85">
            {p.city}, {p.state} {p.zip} · Address on request
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

        <div className="space-y-4 bg-[#f8fafc] px-4 py-5 sm:px-5">
          {p.description ? (
            <p className="text-[14px] leading-relaxed text-[#4b5563]">{p.description}</p>
          ) : null}

          {(p.flags ?? []).length ? (
            <p className="text-[11px] text-[#b45309]">
              Imputed from peer data: {(p.flags ?? []).join(", ")}
            </p>
          ) : null}

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-[#e5e7eb] ring-1 ring-[#e5e7eb] sm:grid-cols-3">
            {[
              ["Ask", usd(p.ask)],
              ["Offer", usd(p.offer)],
              ["Rent", p.rent > 0 ? monthly(p.rent) : "n/a"],
              ["Cash flow", monthly(p.cashFlow)],
              ["After debt (50% dn)", monthly(afterDebt)],
              ["Mortgage (50% dn)", monthly(p.mortgageMonthly)],
              ["Tax", monthly(p.taxMonthly)],
              ["HOA", monthly(p.hoaMonthly)],
              ["Insurance", monthly(p.insuranceMonthly)],
              ["Beds / baths", `${p.beds} / ${baths}`],
              ["Sqft", p.sqft.toLocaleString()],
              ["Year built", String(p.yearBuilt)],
              ...(p.lotSqft
                ? ([["Lot", `${p.lotSqft.toLocaleString()} sqft`]] as [string, string][])
                : []),
            ].map(([k, v]) => (
              <div key={k} className="bg-white px-3 py-2.5">
                <dt className="text-[10px] font-semibold tracking-wide text-[#6b7280] uppercase">
                  {k}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-[#1e3a5f]">{v}</dd>
              </div>
            ))}
          </dl>

          <GetMoreInfoButton dealId={p.id} dealType="property" />
        </div>
      </article>

      <InvestmentModels
        accent={accent}
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
