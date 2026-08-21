import Link from "next/link";
import { ScoreBar } from "../../components/Ui";
import { LAND } from "../../lib/data";
import { usd } from "../../lib/format";

export const metadata = { title: "Land" };

export default function LandPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">LOTS</p>
        <h2 className="display mt-1 text-3xl font-semibold">Land</h2>
        <p className="mt-2 max-w-2xl text-sm text-taupe">
          Zoning, utilities, flood, and three ways out: hold, townhomes, or apartments.
        </p>
      </div>
      <div className="grid gap-4">
        {LAND.map((l) => (
          <Link key={l.id} href={`/land/${l.id}`} className="block bg-cream ring-1 ring-line hover:ring-blue">
            <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
              <div>
                <h3 className="display text-lg font-semibold">{l.address}</h3>
                <p className="text-sm text-taupe">
                  {l.city} {l.zip} · {l.zoning}
                </p>
              </div>
              <div className="w-40">
                <ScoreBar score={l.investorScore} />
              </div>
            </div>
            <p className="px-5 pb-3 text-sm leading-relaxed text-ink/80">{l.thesis}</p>
            <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-5">
              {[
                ["Asking", usd(l.asking)],
                ["$/acre", usd(l.pricePerAcre)],
                ["Acres", l.acres.toFixed(2)],
                ["Max units", String(l.maxUnits)],
                ["Flood", l.floodZone],
              ].map(([k, v]) => (
                <div key={k} className="bg-cream px-4 py-3">
                  <dt className="display text-[9px] tracking-[0.16em] text-taupe">{k}</dt>
                  <dd className="mt-1 text-sm font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </Link>
        ))}
      </div>
    </div>
  );
}
