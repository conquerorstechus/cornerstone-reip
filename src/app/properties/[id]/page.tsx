import Link from "next/link";
import { notFound } from "next/navigation";
import { OsmMap } from "../../../components/OsmMap";
import { RecBadge, ScoreBar } from "../../../components/Ui";
import { areaBySlug, propertyById } from "../../../lib/data";
import { monthly, usd } from "../../../lib/format";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = propertyById(id);
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
          <h2 className="display mt-1 text-3xl font-semibold">{p.address}</h2>
          <p className="text-taupe">
            {p.city}, {p.state} {p.zip}
            {area ? (
              <>
                {" · "}
                <Link href={`/areas/${area.slug}`} className="text-blue hover:underline">
                  {area.name}
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <div className="w-52">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <OsmMap lat={p.lat} lng={p.lng} label={`${p.address}, ${p.city}`} />
        <div className="flex flex-col justify-center bg-cream p-6 ring-1 ring-line">
          <p className="display text-[10px] tracking-[0.22em] text-taupe">NEXT STEP</p>
          <h3 className="display mt-2 text-lg font-semibold">Run the numbers yourself</h3>
          <p className="mt-2 text-sm text-taupe">
            Confirm rent, HOA, and tax before you offer.
          </p>
          <Link
            href={`/analyze?type=property&q=${encodeURIComponent(`${p.address}, ${p.city}, ${p.state} ${p.zip}`)}`}
            className="mt-4 inline-block w-fit bg-magenta px-4 py-2 text-sm font-semibold text-white hover:bg-magenta-dark"
          >
            Analyze this home
          </Link>
        </div>
      </div>
      {p.zillowUrl ? (
        <a href={p.zillowUrl} className="text-sm text-blue hover:underline" target="_blank">
          View on Zillow
        </a>
      ) : null}
    </div>
  );
}
