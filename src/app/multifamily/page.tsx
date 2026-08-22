import Link from "next/link";
import { ScoreBar } from "../../components/Ui";
import { MULTIFAMILY } from "../../lib/data";
import { pct, usd } from "../../lib/format";

export const metadata = { title: "Multifamily" };

export default function MultifamilyPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">APARTMENTS</p>
        <h2 className="display mt-1 text-2xl font-semibold sm:text-3xl">Multifamily</h2>
        <p className="mt-2 max-w-2xl text-sm text-taupe">
          Income, expenses, and cap rate for small apartment buildings. Review unit mix and
          occupancy before you tour.
        </p>
      </div>
      <div className="grid gap-4">
        {MULTIFAMILY.map((m) => (
          <Link key={m.id} href={`/multifamily/${m.id}`} className="block bg-cream ring-1 ring-line hover:ring-blue">
            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4 sm:px-5">
              <div className="min-w-0">
                <h3 className="display text-lg font-semibold break-words">{m.name}</h3>
                <p className="text-sm text-taupe">
                  {m.address}, {m.city} {m.zip} · {m.units} units · {m.yearBuilt}
                </p>
              </div>
              <div className="w-full sm:w-40">
                <ScoreBar score={m.investorScore} />
              </div>
            </div>
            <p className="px-4 pb-3 text-sm leading-relaxed text-ink/80 sm:px-5">{m.thesis}</p>
            <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-5">
              {[
                ["Ask", usd(m.asking)],
                ["Offer", usd(m.offer)],
                ["Cap", pct(m.capRate)],
                ["$/door", usd(m.pricePerUnit)],
                ["Occ.", pct(m.occupancy, 0)],
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
