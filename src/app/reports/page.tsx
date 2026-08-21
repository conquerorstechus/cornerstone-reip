import Link from "next/link";
import { DealCard } from "../../components/DealCard";
import { DIGEST } from "../../lib/data";
import { listRuns } from "../../lib/store";
import { monthly } from "../../lib/format";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const runs = await listRuns();
  return (
    <div className="space-y-8">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">DIGEST</p>
        <h2 className="display mt-1 text-3xl font-semibold">{DIGEST.title}</h2>
        <p className="mt-1 text-sm text-taupe">
          {DIGEST.date} · {DIGEST.source}
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed">{DIGEST.intro}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {DIGEST.deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>

      <p className="text-xs text-taupe">
        Supplementary detail in the same shape as the Friday, August 21, 2026 ops email. Mortgage
        estimated at 7% fixed, 30yr, 50% down. All figures are estimates.
      </p>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h3 className="display text-xl font-semibold">Analysis runs</h3>
          <Link href="/analyze" className="text-sm text-blue hover:underline">
            New analysis
          </Link>
        </div>
        {runs.length === 0 ? (
          <p className="bg-cream px-5 py-8 text-sm text-taupe ring-1 ring-line">
            No custom runs yet. Analyze an address or trigger an n8n workflow — results land here.
          </p>
        ) : (
          <ul className="divide-y divide-stone bg-cream ring-1 ring-line">
            {runs.map((r) => (
              <li key={r.id}>
                <Link href={`/reports/${r.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 hover:bg-stone/40">
                  <div>
                    <p className="font-semibold">{r.result?.title ?? r.query}</p>
                    <p className="text-xs text-taupe">
                      {r.type} · {r.source} · {r.status} · {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {r.result?.cashFlow ? (
                    <p className="text-sm font-semibold text-blue">{monthly(r.result.cashFlow.noi)}</p>
                  ) : (
                    <p className="display text-[10px] tracking-[0.16em] text-taupe">{r.status}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
