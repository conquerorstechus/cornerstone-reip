import Link from "next/link";
import { GetMoreInfoButton } from "./GetMoreInfoButton";
import { monthly, usd } from "../lib/format";
import { LAND_ACCENT } from "../lib/picks";
import type { LandParcel } from "../lib/types";

export function LandCard({ parcel }: { parcel: LandParcel }) {
  const cf = parcel.cashFlow ?? 0;
  const size =
    parcel.acres > 0
      ? `${parcel.acres.toFixed(2)} acres`
      : parcel.lotSqft
        ? `${parcel.lotSqft.toLocaleString()} sqft`
        : "Lot";

  return (
    <article className="card overflow-hidden">
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow inline-flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: LAND_ACCENT }}
              aria-hidden
            />
            Land
          </span>
          {parcel.rank ? <span className="eyebrow">#{parcel.rank}</span> : null}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-navy sm:text-xl">{size}</h3>
          <p className="mt-0.5 text-sm text-taupe">
            {parcel.city}, FL {parcel.zip}
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-3 rounded-xl bg-paper px-4 py-3">
          <div>
            <dt className="eyebrow">Asking</dt>
            <dd className="mt-1 font-display text-base font-semibold tabular-nums text-navy sm:text-lg">
              {usd(parcel.asking)}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Per acre</dt>
            <dd className="mt-1 font-display text-base font-semibold tabular-nums text-navy sm:text-lg">
              {usd(parcel.pricePerAcre)}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Cash flow</dt>
            <dd
              className={`mt-1 font-display text-base font-semibold tabular-nums sm:text-lg ${
                cf >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {monthly(cf)}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={`/land/${encodeURIComponent(parcel.id)}`} className="btn btn-secondary flex-1">
            See the models
          </Link>
          <GetMoreInfoButton dealId={parcel.id} dealType="land" className="flex-1" />
        </div>
      </div>
    </article>
  );
}
