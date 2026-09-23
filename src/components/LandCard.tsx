import Link from "next/link";
import { GetMoreInfoButton } from "./GetMoreInfoButton";
import type { LandParcel } from "../lib/types";
import { cashDownYearlyRor, monthly, pct, truncateCopy, usd } from "../lib/format";

export function LandCard({ parcel }: { parcel: LandParcel }) {
  const cf = parcel.cashFlow ?? 0;
  const cfPositive = cf >= 0;
  const desc = truncateCopy(parcel.thesis, 240);
  const flags = (parcel.flags ?? []).filter(Boolean);
  const lotLabel =
    parcel.acres > 0
      ? `${parcel.acres.toFixed(2)} acres`
      : parcel.lotSqft
        ? `${parcel.lotSqft.toLocaleString()} sqft`
        : null;
  const purchase = parcel.offer ?? parcel.asking;
  const yearlyRor = cashDownYearlyRor({ cashFlowMonthly: cf, purchasePrice: purchase });
  const rorPositive = yearlyRor >= 0;

  return (
    <article className="overflow-hidden rounded-lg border border-[#e5e7eb] border-l-4 border-l-[#0d9488] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-[#0d9488] px-4 py-3 text-[13px] text-white sm:px-4.5">
        <span className="font-bold">{parcel.rank ? `Rank #${parcel.rank}` : "Lot"}</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
          Land
        </span>
        <span className="ml-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-1 font-medium">
          <span>
            Cash Flow: <strong className={cfPositive ? "" : "text-red-100"}>{monthly(cf)}</strong>
          </span>
          <span>
            Yr ROR (cash):{" "}
            <strong className={rorPositive ? "" : "text-red-100"}>{pct(yearlyRor * 100, 1)}</strong>
          </span>
        </span>
      </div>

      <div className="space-y-3 bg-[#f0fdfa] px-4 py-3.5 sm:px-4.5">
        <div>
          <p className="text-[13px] font-bold text-[#1e3a5f]">
            {parcel.city}, FL {parcel.zip}
            <span className="font-medium text-[#6b7280]"> · Address on request</span>
          </p>
          {desc ? (
            <p className="mt-1 text-[13px] leading-relaxed text-[#6b7280] italic">{desc}</p>
          ) : null}
        </div>

        {flags.length ? (
          <p className="text-[11px] text-[#b45309]">
            Imputed from peer data: {flags.join(", ")}
          </p>
        ) : null}

        <div className="grid gap-1.5 text-[13px] text-[#374151] sm:grid-cols-2">
          <p>
            Asking: <strong>{usd(parcel.asking)}</strong>
          </p>
          <p className="sm:text-right">
            $/acre: <strong>{usd(parcel.pricePerAcre)}</strong>
          </p>
          {lotLabel ? (
            <p className="sm:col-span-2">
              Lot size: <strong>{lotLabel}</strong>
            </p>
          ) : null}
          <p>
            Offer: <strong>{usd(parcel.offer ?? parcel.asking)}</strong>
          </p>
          <p className="sm:text-right">HOA: {monthly(parcel.hoaMonthly ?? 0)}</p>
          <p>Taxes: {monthly(parcel.taxMonthly ?? 0)}</p>
          <p className="sm:text-right">Insurance: {monthly(parcel.insuranceMonthly ?? 0)}</p>
          <p>
            Cash flow:{" "}
            <strong className={cfPositive ? "text-[#16a34a]" : "text-[#dc2626]"}>
              {monthly(cf)}
            </strong>
          </p>
          <p className="sm:text-right">
            Mortgage*: <strong>{monthly(parcel.mortgageMonthly ?? 0)}</strong>
          </p>
          <p className="sm:col-span-2">
            Yearly ROR (100% cash down):{" "}
            <strong className={rorPositive ? "text-[#16a34a]" : "text-[#dc2626]"}>
              {pct(yearlyRor * 100, 1)}
            </strong>
            <span className="text-[#6b7280]">
              {" "}
              · leftover cash ÷ {usd(purchase)} with no mortgage
            </span>
          </p>
        </div>

        <div className="border-t border-black/5 pt-3 text-[13px] text-[#374151]">
          <p className="text-[11px] italic text-[#6b7280]">
            * Mortgage estimated at 7% fixed, 30 years, 50% down.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href={`/land/${parcel.id}`}
            className="inline-flex min-h-10 flex-1 items-center justify-center bg-[#0d9488] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0f766e]"
          >
            Full analysis &amp; models
          </Link>
          <div className="flex-1">
            <GetMoreInfoButton dealId={parcel.id} dealType="land" />
          </div>
        </div>
      </div>
    </article>
  );
}
