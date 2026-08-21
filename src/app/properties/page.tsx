import { DealCard } from "../../components/DealCard";
import { PROPERTIES } from "../../lib/data";

export const metadata = { title: "Properties" };

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">SFR / TOWNHOME</p>
        <h2 className="display mt-1 text-3xl font-semibold">Properties</h2>
        <p className="mt-2 max-w-2xl text-sm text-taupe">
          Ranked by cash flow using the High ROI Picks methodology. Click through for the full
          underwriting stack, map, and a one-click n8n re-run.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {PROPERTIES.map((p) => (
          <DealCard key={p.id} deal={p} />
        ))}
      </div>
    </div>
  );
}
