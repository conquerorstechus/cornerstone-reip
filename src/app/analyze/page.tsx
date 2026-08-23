import Link from "next/link";
import { AnalyzeForm } from "../../components/AnalyzeForm";
import { listRuns } from "../../lib/store";
import { monthly } from "../../lib/format";
import type { AssetType } from "../../lib/types";

export const metadata = { title: "Analyze" };

const ENABLED_TYPES: AssetType[] = ["property", "area"];

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const type = ENABLED_TYPES.includes(sp.type as AssetType) ? (sp.type as AssetType) : "property";
  const runs = await listRuns();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">CHECK A DEAL</p>
        <h2 className="display mt-1 text-2xl font-semibold sm:text-3xl">Analyze an address</h2>
        <p className="mt-2 text-sm text-taupe">
          See suggested offer, estimated rent, and monthly cash flow. Mortgage is modeled at 50%
          down, 7% interest, 30 years.
        </p>
      </div>
      <AnalyzeForm defaultType={type} defaultQuery={sp.q ?? ""} />

      <section>
        <h3 className="display mb-3 text-xl font-semibold">Your analyses</h3>
        {runs.length === 0 ? (
          <p className="bg-cream px-5 py-8 text-sm text-taupe ring-1 ring-line">
            No saved analyses yet. Run one above and it will show up here.
          </p>
        ) : (
          <ul className="divide-y divide-stone bg-cream ring-1 ring-line">
            {runs.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/reports/${r.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 hover:bg-stone/40"
                >
                  <div>
                    <p className="font-semibold">{r.result?.title ?? r.query}</p>
                    <p className="text-xs text-taupe">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  {r.result?.cashFlow ? (
                    <p className="text-sm font-semibold text-blue">{monthly(r.result.cashFlow.noi)}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
