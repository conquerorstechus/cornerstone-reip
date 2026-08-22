import { DealCard } from "../../components/DealCard";
import { PROPERTIES } from "../../lib/data";

export const metadata = { title: "Properties" };

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">HOMES</p>
        <h2 className="display mt-1 text-2xl font-semibold sm:text-3xl">Properties</h2>
        <p className="mt-2 max-w-2xl text-sm text-taupe">
          Ranked by monthly cash flow. Open a home for the full numbers and a map.
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
