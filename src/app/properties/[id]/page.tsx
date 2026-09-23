import { notFound } from "next/navigation";
import Link from "next/link";
import { GetMoreInfoButton } from "../../../components/GetMoreInfoButton";
import { OsmMap } from "../../../components/OsmMap";
import { RecBadge, ScoreBar } from "../../../components/Ui";
import { areaBySlug, propertyById } from "../../../lib/data";
import { listingHeadline, monthly, usd } from "../../../lib/format";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await propertyById(id);
  if (!p) notFound();
  const area = areaBySlug(p.areaSlug);
  const afterDebt = p.cashFlow - p.mortgageMonthly;
  const rec = p.cashFlow >= 1300 ? "pursue" : p.cashFlow >= 1100 ? "watch" : "pass";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {p.rank ? (
            <p className="display text-[11px] tracking-[0.28em] text-magenta">RANK #{p.rank}</p>
          ) : null}
          <h2 className="display mt-1 text-2xl font-semibold break-words sm:text-3xl">
            {listingHeadline(p)}
          </h2>
          <p className="text-taupe">
            Greater Tampa
            {area ? (
              <>
                {" · "}
                <Link href={`/areas/${area.slug}`} className="text-blue hover:underline">
                  {area.name}
                </Link>
              </>
            ) : null}
            {" · Address on request"}
          </p>
        </div>
        <div className="w-full sm:w-52">
          <RecBadge rec={rec} />
          <div className="mt-3">
            <ScoreBar score={Math.min(96, 50 + Math.round(p.cashFlow / 40))} />
          </div>
        </div>
      </div>

      <p className="max-w-3xl text-sm leading-relaxed">{p.description}</p>

      <dl className="grid grid-cols-2 gap-px bg-line ring-1 ring-line sm:grid-cols-5">
        {[
          ["Ask", usd(p.ask)],
          ["Offer", usd(p.offer)],
          ["Rent (est.)", monthly(p.rent)],
          ["Cash flow", monthly(p.cashFlow)],
          ["After debt", monthly(afterDebt)],
          ["Tax", monthly(p.taxMonthly)],
          ["HOA", monthly(p.hoaMonthly)],
          ["Insurance", monthly(p.insuranceMonthly)],
          ["Mortgage*", monthly(p.mortgageMonthly)],
          ["Beds / Baths / Sqft", `${p.beds} / ${p.baths} / ${p.sqft.toLocaleString()}`],
        ].map(([k, v]) => (
          <div key={k} className="bg-cream px-4 py-3">
            <dt className="display text-[9px] tracking-[0.16em] text-taupe">{k}</dt>
            <dd className="mt-1 text-sm font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-taupe">
        * Mortgage estimated at 7% fixed, 30 years, 50% down. This payment decreases when rates
        drop and you refinance. Cash flow is rent minus tax, HOA, and insurance (before the mortgage).
      </p>

      <GetMoreInfoButton dealId={p.id} />

      {area ? (
        <OsmMap lat={area.lat} lng={area.lng} zoom={12} label={`${area.name} · Greater Tampa`} />
      ) : null}
    </div>
  );
}
