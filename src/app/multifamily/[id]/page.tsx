import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalyzeForm } from "../../../components/AnalyzeForm";
import { OsmMap } from "../../../components/OsmMap";
import { ScoreBar, SectionTitle } from "../../../components/Ui";
import { areaBySlug, mfById } from "../../../lib/data";
import { monthly, pct, usd } from "../../../lib/format";

export default async function MultifamilyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const m = mfById(id);
  if (!m) notFound();
  const area = areaBySlug(m.areaSlug);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="display text-[11px] tracking-[0.28em] text-magenta">MULTIFAMILY</p>
          <h2 className="display mt-1 text-3xl font-semibold">{m.name}</h2>
          <p className="text-taupe">
            {m.address}, {m.city} FL {m.zip}
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
        <div className="w-48">
          <ScoreBar score={m.investorScore} />
        </div>
      </div>
      <p className="max-w-3xl text-sm leading-relaxed">{m.thesis}</p>

      <dl className="grid grid-cols-2 gap-px bg-line ring-1 ring-line sm:grid-cols-5">
        {[
          ["Ask", usd(m.asking)],
          ["Offer", usd(m.offer)],
          ["Units", String(m.units)],
          ["Occupancy", pct(m.occupancy, 0)],
          ["Year built", String(m.yearBuilt)],
          ["GPR", usd(m.gpr)],
          ["EGI", usd(m.egi)],
          ["Expenses", usd(m.expenses)],
          ["NOI", usd(m.noi)],
          ["Cap rate", pct(m.capRate)],
          ["GRM", m.grm.toFixed(2)],
          ["$/door", usd(m.pricePerUnit)],
          ["Debt yield", pct(m.debtYield)],
          ["Expense ratio", pct((m.expenses / m.egi) * 100)],
        ].map(([k, v]) => (
          <div key={k} className="bg-cream px-4 py-3">
            <dt className="display text-[9px] tracking-[0.16em] text-taupe">{k}</dt>
            <dd className="mt-1 text-sm font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <section>
        <SectionTitle kicker="UNIT MIX" title="In-place rents" />
        <table className="w-full bg-cream text-sm ring-1 ring-line">
          <thead>
            <tr className="display text-left text-[10px] tracking-[0.16em] text-taupe">
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Count</th>
              <th className="px-4 py-2">Rent</th>
              <th className="px-4 py-2">Monthly</th>
            </tr>
          </thead>
          <tbody>
            {m.unitMix.map((u) => (
              <tr key={u.type} className="border-t border-stone">
                <td className="px-4 py-2">{u.type}</td>
                <td className="px-4 py-2">{u.count}</td>
                <td className="px-4 py-2">{monthly(u.rent)}</td>
                <td className="px-4 py-2">{usd(u.rent * u.count)}/mo</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="bg-cream p-5 ring-1 ring-line">
        <h3 className="display text-sm font-semibold tracking-[0.08em]">Risks</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {m.risks.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-magenta" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <OsmMap lat={m.lat} lng={m.lng} label={m.name} />
      <AnalyzeForm defaultType="multifamily" defaultQuery={`${m.name}, ${m.city}`} />
    </div>
  );
}
