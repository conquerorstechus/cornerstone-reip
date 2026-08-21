import { AnalyzeForm } from "../../components/AnalyzeForm";
import type { AssetType } from "../../lib/types";

export const metadata = { title: "Analyze" };

const TYPES: AssetType[] = ["property", "area", "land", "multifamily"];

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const type = TYPES.includes(sp.type as AssetType) ? (sp.type as AssetType) : "property";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">CHECK A DEAL</p>
        <h2 className="display mt-1 text-3xl font-semibold">Analyze an address</h2>
        <p className="mt-2 text-sm text-taupe">
          See suggested offer, estimated rent, and monthly cash flow. Mortgage is modeled at 50%
          down, 7% interest, 30 years.
        </p>
      </div>
      <AnalyzeForm defaultType={type} defaultQuery={sp.q ?? ""} />
    </div>
  );
}
