import Link from "next/link";
import { GetMoreInfoButton } from "./GetMoreInfoButton";
import { assetClassFromHomeKind, getAppreciationProfile } from "../lib/appreciation";
import { appreciationSchedule, cashOnCashAtDown } from "../lib/investment";
import type { HomeKind, Property } from "../lib/types";
import { cashDownYearlyRor, monthly, pct, truncateCopy, usd } from "../lib/format";

const THEME: Record<
  HomeKind,
  { bar: string; head: string; body: string; label: string }
> = {
  sfh: {
    bar: "border-l-[#1e40af]",
    head: "bg-[#1e40af]",
    body: "bg-[#eff6ff]",
    label: "Single Family Home",
  },
  condo: {
    bar: "border-l-[#7c3aed]",
    head: "bg-[#7c3aed]",
    body: "bg-[#f5f3ff]",
    label: "Condo",
  },
  townhouse: {
    bar: "border-l-[#6d28d9]",
    head: "bg-[#6d28d9]",
    body: "bg-[#f5f3ff]",
    label: "Townhome",
  },
};

export function DealCard({ deal, compact }: { deal: Property; compact?: boolean }) {
  const kind = deal.homeKind ?? "sfh";
  const theme = THEME[kind];
  const cfPositive = deal.cashFlow >= 0;
  const baths = Number.isInteger(deal.baths) ? String(deal.baths) : String(deal.baths);
  const desc = truncateCopy(deal.description, compact ? 140 : 240);
  const flags = (deal.flags ?? []).filter(Boolean);
  const lotLabel =
    deal.lotSqft && deal.lotSqft > 0 ? `${deal.lotSqft.toLocaleString()} sqft` : null;
  const purchase = deal.offer || deal.ask;
  const yearlyRor = cashDownYearlyRor({
    cashFlowMonthly: deal.cashFlow,
    purchasePrice: purchase,
  });
  const rorPositive = yearlyRor >= 0;
  const financials = {
    purchasePrice: purchase,
    rentMonthly: deal.rent,
    taxMonthly: deal.taxMonthly,
    hoaMonthly: deal.hoaMonthly,
    insuranceMonthly: deal.insuranceMonthly,
  };
  const halfDown = cashOnCashAtDown(financials, 50);
  const tenYear = appreciationSchedule(
    financials,
    getAppreciationProfile(assetClassFromHomeKind(kind)),
    "base",
    50,
    10,
  ).at(-1);
  const tenYearTotal = tenYear
    ? tenYear.cumulativeCashFlow + (tenYear.equity - halfDown.downPayment)
    : null;

  return (
    <article
      className={`overflow-hidden rounded-lg border border-[#e5e7eb] border-l-4 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${theme.bar}`}
    >
      <div
        className={`flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 text-[13px] text-white sm:px-4.5 ${theme.head}`}
      >
        <span className="font-bold">
          {deal.rank ? `Rank #${deal.rank}` : "Deal"}
        </span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
          {theme.label}
        </span>
        <span className="ml-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-1 font-medium">
          <span>
            Cash Flow:{" "}
            <strong className={cfPositive ? "" : "text-red-100"}>{monthly(deal.cashFlow)}</strong>
          </span>
          <span>
            Yr ROR (cash):{" "}
            <strong className={rorPositive ? "" : "text-red-100"}>{pct(yearlyRor * 100, 1)}</strong>
          </span>
        </span>
      </div>

      <div className={`space-y-3 px-4 py-3.5 sm:px-4.5 ${theme.body}`}>
        <div>
          <p className="text-[13px] font-bold text-[#1e3a5f]">
            {deal.beds} bed / {baths} bath · {deal.city}, {deal.state} {deal.zip}
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
            <strong>
              {deal.beds}bd / {baths}ba
            </strong>
            {" · "}
            {deal.sqft.toLocaleString()} sqft
          </p>
          <p className="sm:text-right">
            Asking: <strong>{usd(deal.ask)}</strong>
          </p>
          {lotLabel ? (
            <p className="sm:col-span-2">
              Lot size: <strong>{lotLabel}</strong>
            </p>
          ) : null}
          <p>
            Offer: <strong>{usd(deal.offer)}</strong>
          </p>
          <p className="sm:text-right">HOA: {monthly(deal.hoaMonthly)}</p>
          <p>Taxes: {monthly(deal.taxMonthly)}</p>
          <p className="sm:text-right">Insurance: {monthly(deal.insuranceMonthly)}</p>
          <p>
            Rent:{" "}
            <strong>{deal.rent > 0 ? monthly(deal.rent) : "Unable to calculate"}</strong>
          </p>
          <p className="sm:text-right">
            Cash flow:{" "}
            <strong className={cfPositive ? "text-[#16a34a]" : "text-[#dc2626]"}>
              {monthly(deal.cashFlow)}
            </strong>
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
          <p>
            Mortgage (30yr · 50% down · 7%): <strong>{monthly(deal.mortgageMonthly)}</strong>
          </p>
          <p className="mt-1 text-[11px] italic text-[#6b7280]">
            * This payment will decrease when interest rates drop and the property is refinanced.{" "}
            <Link
              href={`/mortgage?price=${Math.round(purchase)}&down=${Math.round(purchase * 0.5)}&rate=7`}
              className="font-semibold text-[#1d4ed8] not-italic hover:underline"
            >
              Open calculator →
            </Link>
          </p>
        </div>

        <div className="rounded-md bg-white/80 px-3 py-3 text-[13px] leading-relaxed text-[#1e3a5f] ring-1 ring-black/5">
          <p className="font-bold">The simple picture</p>
          <p className="mt-1">
            Put half down and about{" "}
            <strong
              className={halfDown.cashFlowMonthly >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"}
            >
              {monthly(halfDown.cashFlowMonthly)}
            </strong>{" "}
            could be left each month after the bills.
            {tenYear && tenYearTotal != null ? (
              <>
                {" "}
                Hold it 10 years at a normal growth guess and it could be worth{" "}
                <strong>{usd(tenYear.propertyValue)}</strong>, with rent leftovers and price growth
                adding up to about <strong>{usd(tenYearTotal)}</strong>.
              </>
            ) : null}
          </p>
          <Link
            href={`/properties/${deal.id}#models`}
            className="mt-2 inline-flex font-semibold text-[#1d4ed8] hover:underline"
          >
            See all four growth stories on one page →
          </Link>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href={`/properties/${deal.id}#models`}
            className={`inline-flex min-h-10 flex-1 items-center justify-center px-3 py-2 text-sm font-semibold text-white ${theme.head} hover:opacity-90`}
          >
            See the models
          </Link>
          <div className="flex-1">
            <GetMoreInfoButton dealId={deal.id} dealType="property" />
          </div>
        </div>
      </div>
    </article>
  );
}
