import Link from "next/link";
import { ScoreBar } from "../../components/Ui";
import { AREAS } from "../../lib/data";
import { monthly, pct, usd } from "../../lib/format";

export const metadata = { title: "Areas" };

export default function AreasPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">SUBMARKETS</p>
        <h2 className="display mt-1 text-2xl font-semibold sm:text-3xl">Areas</h2>
        <p className="mt-2 max-w-2xl text-sm text-taupe">
          Greater Tampa submarkets on this week’s High ROI list — cash flow, jobs, flood risk, and
          renter demand in one score.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {AREAS.map((a) => (
          <Link key={a.slug} href={`/areas/${a.slug}`} className="bg-cream p-4 ring-1 ring-line hover:ring-blue sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <h3 className="display text-lg font-semibold">{a.name}</h3>
                <p className="text-sm text-taupe">
                  {a.county} · {a.zips.join(", ")}
                </p>
              </div>
              <div className="w-full sm:w-36">
                <ScoreBar score={a.investorScore} />
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink/80">{a.thesis}</p>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-sm sm:gap-3">
              <div>
                <dt className="display text-[9px] tracking-[0.16em] text-taupe">Median ask</dt>
                <dd className="font-semibold">{usd(a.medianAsk)}</dd>
              </div>
              <div>
                <dt className="display text-[9px] tracking-[0.16em] text-taupe">Median CF</dt>
                <dd className="font-semibold text-blue">{monthly(a.medianCf)}</dd>
              </div>
              <div>
                <dt className="display text-[9px] tracking-[0.16em] text-taupe">YoY price</dt>
                <dd className="font-semibold">{pct(a.yoyPrice)}</dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>
    </div>
  );
}
