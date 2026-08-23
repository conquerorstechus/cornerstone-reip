export default function ContractorsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">TRADES</p>
        <h2 className="display mt-1 text-2xl font-semibold sm:text-3xl">Contractors</h2>
        <p className="mt-2 max-w-2xl text-sm text-taupe">
          Sam’s approved Greater Tampa list — roofing, HVAC, plumbing, electrical, and GC.
        </p>
      </div>
      <ul className="divide-y divide-stone bg-cream ring-1 ring-line">
        {["Roofing", "HVAC", "Plumbing", "Electrical", "General contractor"].map((trade) => (
          <li key={trade} className="px-5 py-3 text-sm">
            {trade}
          </li>
        ))}
      </ul>
    </div>
  );
}
