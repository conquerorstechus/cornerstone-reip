import Link from "next/link";
import { notFound } from "next/navigation";
import { OsmMap } from "../../../components/OsmMap";
import { ScoreBar, SectionTitle, TableScroll } from "../../../components/Ui";
import { areaBySlug, landById } from "../../../lib/data";
import { pct, usd } from "../../../lib/format";

export default async function LandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const l = await landById(id);
  if (!l) notFound();
  const area = areaBySlug(l.areaSlug);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="display text-[11px] tracking-[0.28em] text-magenta">LAND</p>
          <h2 className="display mt-1 text-2xl font-semibold break-words sm:text-3xl">{l.address}</h2>
          <p className="text-taupe">
            {l.city}, FL {l.zip}
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
        <div className="w-full sm:w-48">
          <ScoreBar score={l.investorScore} />
        </div>
      </div>
      <p className="max-w-3xl text-sm leading-relaxed">{l.thesis}</p>

      <dl className="grid grid-cols-2 gap-px bg-line ring-1 ring-line sm:grid-cols-4">
        {[
          ["Asking", usd(l.asking)],
          ["$/acre", usd(l.pricePerAcre)],
          ["Acres", l.acres.toFixed(2)],
          ["Buildable", `${l.buildableSf.toLocaleString()} sf`],
          ["Max units", String(l.maxUnits)],
          ["Zoning", l.zoning],
          ["Flood", l.floodZone],
          ["Utilities", l.utilities.join(", ")],
        ].map(([k, v]) => (
          <div key={k} className="bg-cream px-4 py-3">
            <dt className="display text-[9px] tracking-[0.16em] text-taupe">{k}</dt>
            <dd className="mt-1 text-sm font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <section>
        <SectionTitle kicker="EXITS" title="Development scenarios" />
        <TableScroll>
        <table className="w-full min-w-[36rem] bg-cream text-sm ring-1 ring-line">
          <thead>
            <tr className="display text-left text-[10px] tracking-[0.16em] text-taupe">
              <th className="px-4 py-2">Scenario</th>
              <th className="px-4 py-2">Units</th>
              <th className="px-4 py-2">Cost</th>
              <th className="px-4 py-2">Exit</th>
              <th className="px-4 py-2">Profit</th>
              <th className="px-4 py-2">ROI</th>
            </tr>
          </thead>
          <tbody>
            {l.scenarios.map((s) => (
              <tr key={s.name} className="border-t border-stone">
                <td className="px-4 py-2 font-semibold">{s.name}</td>
                <td className="px-4 py-2">{s.units || "—"}</td>
                <td className="px-4 py-2">{usd(s.cost)}</td>
                <td className="px-4 py-2">{usd(s.exitValue)}</td>
                <td className="px-4 py-2">{usd(s.profit)}</td>
                <td className="px-4 py-2 text-blue">{pct(s.roi)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </TableScroll>
      </section>

      <section>
        <SectionTitle kicker="COMPS" title="Land sales" />
        <ul className="divide-y divide-stone bg-cream ring-1 ring-line">
          {l.comps.map((c) => (
            <li key={c.address} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
              <span>{c.address}</span>
              <span className="text-taupe">
                {c.acres} ac · {usd(c.price)} · {c.closed}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <OsmMap lat={l.lat} lng={l.lng} label={l.address} />
      <Link
        href={`/analyze?type=land&q=${encodeURIComponent(`${l.address}, ${l.city}, FL ${l.zip}`)}`}
        className="inline-flex min-h-11 items-center bg-magenta px-4 py-2 text-sm font-semibold text-white hover:bg-magenta-dark"
      >
        Analyze this land
      </Link>
    </div>
  );
}
