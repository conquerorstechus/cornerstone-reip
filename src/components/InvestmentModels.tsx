"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { AppreciationProfile, AppreciationScenario } from "../lib/appreciation";
import { annualRateForScenario } from "../lib/appreciation";
import {
  appreciationSchedule,
  cashOnCashAtDown,
  type DealFinancials,
} from "../lib/investment";
import { monthly, pct, usd } from "../lib/format";

const SCENARIOS: { id: AppreciationScenario; label: string; plain: string }[] = [
  {
    id: "historical",
    label: "Like the last 10 years",
    plain: "Uses how fast this type of property grew in Tampa over the past 10 years.",
  },
  {
    id: "conservative",
    label: "Slow growth",
    plain: "Assumes prices go up slowly. Safer / more careful guess.",
  },
  {
    id: "base",
    label: "Normal growth",
    plain: "A middle-of-the-road guess for the next several years.",
  },
  {
    id: "optimistic",
    label: "Fast growth",
    plain: "Assumes a strong market. Good case, not a promise.",
  },
];

function PlainBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-[#bfdbfe] bg-[#eff6ff] px-3 py-3 text-[13px] leading-relaxed text-[#1e3a5f]">
      <p className="font-bold">{title}</p>
      <div className="mt-1 space-y-1.5 text-[#374151]">{children}</div>
    </div>
  );
}

export function InvestmentModels({
  financials,
  profile,
  accent = "#1e40af",
}: {
  financials: DealFinancials;
  profile: AppreciationProfile;
  accent?: string;
}) {
  const [downPct, setDownPct] = useState(50);
  const [horizon, setHorizon] = useState(10);
  const [scenario, setScenario] = useState<AppreciationScenario>("base");

  const coc = useMemo(() => cashOnCashAtDown(financials, downPct), [financials, downPct]);
  const schedule = useMemo(
    () => appreciationSchedule(financials, profile, scenario, downPct, 15),
    [financials, profile, scenario, downPct],
  );
  const selected = schedule[horizon - 1];
  const annualRate = annualRateForScenario(profile, scenario);
  const fullCash = useMemo(() => cashOnCashAtDown(financials, 100), [financials]);
  const halfDown = useMemo(() => cashOnCashAtDown(financials, 50), [financials]);

  const blend = useMemo(() => {
    if (!selected) return null;
    const rentIncome = selected.cumulativeCashFlow;
    const appreciationGain = selected.equity - coc.downPayment;
    const total = rentIncome + appreciationGain;
    const rentShare = total !== 0 ? rentIncome / Math.abs(total) : 0;
    const apprShare = total !== 0 ? appreciationGain / Math.abs(total) : 0;
    return { rentIncome, appreciationGain, total, rentShare, apprShare };
  }, [selected, coc.downPayment]);

  const glance = useMemo(() => {
    return SCENARIOS.map((s) => {
      const row = appreciationSchedule(financials, profile, s.id, 50, 10).at(-1);
      return row ? { ...s, row } : null;
    }).filter((s): s is NonNullable<typeof s> => s != null);
  }, [financials, profile]);

  return (
    <div className="space-y-8" id="models">
      <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="px-4 py-3 text-white sm:px-5" style={{ backgroundColor: accent }}>
          <p className="text-[11px] font-semibold tracking-wide uppercase opacity-90">Money Models</p>
          <h3 className="text-lg font-bold">Summary of the various models</h3>
        </div>
        <div className="space-y-4 bg-[#f8fafc] px-4 py-5 sm:px-5">
          <p className="text-[14px] leading-relaxed text-[#374151]">
             These numbers use a simple setup: you put{" "}
            <strong>half the price down</strong> and keep the property for <strong>10 years</strong>.
            Each card is a different guess about how fast prices rise.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-white px-3 py-3 ring-1 ring-[#e5e7eb]">
              <p className="text-[10px] font-semibold tracking-wide text-[#6b7280] uppercase">
                Cash left each month (half down)
              </p>
              <p
                className={`mt-1 text-2xl font-bold tabular-nums ${
                  halfDown.cashFlowMonthly >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"
                }`}
              >
                {monthly(halfDown.cashFlowMonthly)}
              </p>
              <p className="mt-1 text-[12px] text-[#6b7280]">
                Rent minus taxes, HOA, insurance, and the mortgage. That’s about{" "}
                {pct(halfDown.cashOnCash * 100, 1)} a year on the money you put in.
              </p>
            </div>
            <div className="rounded-md bg-white px-3 py-3 ring-1 ring-[#e5e7eb]">
              <p className="text-[10px] font-semibold tracking-wide text-[#6b7280] uppercase">
                If you pay all cash
              </p>
              <p
                className={`mt-1 text-2xl font-bold tabular-nums ${
                  fullCash.cashFlowMonthly >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"
                }`}
              >
                {monthly(fullCash.cashFlowMonthly)}
              </p>
              <p className="mt-1 text-[12px] text-[#6b7280]">
                No mortgage payment. About {pct(fullCash.cashOnCash * 100, 1)} a year on the full
                purchase price.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {glance.map((s) => {
              const total = s.row.cumulativeCashFlow + (s.row.equity - halfDown.downPayment);
              return (
                <div key={s.id} className="rounded-md bg-white px-3 py-3 ring-1 ring-[#e5e7eb]">
                  <p className="text-[13px] font-bold text-[#1e3a5f]">{s.label}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-[#4b5563]">{s.plain}</p>
                  <dl className="mt-3 space-y-1 text-[13px] text-[#374151]">
                    <div className="flex justify-between gap-3">
                      <dt>Worth in 10 years</dt>
                      <dd className="font-semibold tabular-nums">{usd(s.row.propertyValue)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Rent leftovers stacked</dt>
                      <dd className="font-semibold tabular-nums">{usd(s.row.cumulativeCashFlow)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Rent + price growth</dt>
                      <dd
                        className={`font-bold tabular-nums ${
                          total >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"
                        }`}
                      >
                        {usd(total)}
                      </dd>
                    </div>
                  </dl>
                </div>
              );
            })}
          </div>
          <p className="text-[12px] text-[#6b7280]">
            The sections below let you move the down payment and the years if you want. You already
            have the picture if you stop here.
          </p>
        </div>
      </section>

      {/* —— Cash on cash —— */}
      <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="px-4 py-3 text-white sm:px-5" style={{ backgroundColor: accent }}>
          <p className="text-[11px] font-semibold tracking-wide uppercase opacity-90">Model 1</p>
          <h3 className="text-lg font-bold">Cash-on-cash (your yearly paycheck %)</h3>
        </div>
        <div className="space-y-5 bg-[#f8fafc] px-4 py-5 sm:px-5">
          <PlainBox title="What is this in plain English?">
            <p>
              Imagine you put some money down to buy the house. Every month, tenants pay rent. After
              you pay taxes, HOA, insurance, and the mortgage, whatever cash is left is your
              “paycheck” from the property.
            </p>
            <p>
              <strong>Cash-on-cash</strong> answers: “If I put in $X, what % of that do I get back
              each year in leftover cash?” Example: put in $100,000 and get $8,000/year left over →
              8% cash-on-cash.
            </p>
            <p>
              Move the slider to change how much you put down (1% = mostly borrowed, 100% = you pay
              all cash and have no mortgage payment).
            </p>
          </PlainBox>

          <div className="grid gap-3 sm:grid-cols-3">
            <Metric
              label="If you pay all cash"
              value={pct(fullCash.cashOnCash * 100, 1)}
              hint={`You keep about ${monthly(fullCash.cashFlowMonthly)} every month after bills`}
            />
            <Metric
              label="With this down payment"
              value={pct(coc.cashOnCash * 100, 1)}
              hint={`${Math.round(downPct)}% down = ${usd(coc.downPayment)} of your money`}
            />
            <Metric
              label="Cash left each month"
              value={monthly(coc.cashFlowMonthly)}
              hint={
                coc.allCash
                  ? "Rent minus taxes, HOA, insurance"
                  : `After also paying the ${monthly(coc.mortgageMonthly)} mortgage`
              }
              tone={coc.cashFlowMonthly >= 0 ? "good" : "bad"}
            />
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3 text-[13px]">
              <label htmlFor="down-slider" className="font-semibold text-[#1e3a5f]">
                How much do you put down?
              </label>
              <span className="tabular-nums text-[#374151]">
                <strong>{Math.round(downPct)}%</strong>
                {" · "}
                {usd(coc.downPayment)}
                {!coc.allCash ? ` · bank loan ${usd(coc.loanAmount)}` : " · no loan"}
              </span>
            </div>
            <input
              id="down-slider"
              type="range"
              min={1}
              max={100}
              step={1}
              value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e5e7eb]"
              style={{ accentColor: accent }}
            />
            <div className="mt-1 flex justify-between text-[11px] text-[#6b7280]">
              <span>1% down</span>
              <span>50%</span>
              <span>100% all cash</span>
            </div>
          </div>

          <a
            href={`/mortgage?price=${Math.round(financials.purchasePrice)}&down=${Math.round(coc.downPayment)}&rate=${((financials.rate ?? 0.07) * 100).toFixed(3)}`}
            className="inline-flex text-[13px] font-semibold text-[#1d4ed8] hover:underline"
          >
            Open mortgage calculator with these numbers →
          </a>
        </div>
      </section>

      {/* —— Appreciation —— */}
      <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="px-4 py-3 text-white sm:px-5" style={{ backgroundColor: accent }}>
          <p className="text-[11px] font-semibold tracking-wide uppercase opacity-90">Model 2</p>
          <h3 className="text-lg font-bold">Price growth (will the property be worth more?)</h3>
        </div>
        <div className="space-y-5 bg-[#f8fafc] px-4 py-5 sm:px-5">
          <PlainBox title="What is this in plain English?">
            <p>
              Houses (and land) often cost more years later than they do today. That rise in price is
              called <strong>appreciation</strong>.
            </p>
            <p>
              This model guesses: “If prices grow like ___, what is this property worth after 1 to 15
              years?” It also tracks how much of the loan you’ve paid off, so you can see your{" "}
              <strong>equity</strong> (value minus what’s still owed to the bank).
            </p>
            <p>
              Pick a growth speed below, then slide how many years you plan to hold. These are
              scenarios — not guarantees.
            </p>
          </PlainBox>

          <p className="text-[12px] text-[#6b7280]">{profile.sourceNote}</p>

          <div className="grid gap-2 sm:grid-cols-3">
            {profile.trailingCagr.map((c) => (
              <div key={c.years} className="rounded-md bg-white px-3 py-2 ring-1 ring-[#e5e7eb]">
                <p className="text-[10px] font-semibold tracking-wide text-[#6b7280] uppercase">
                  Last {c.years} year{c.years > 1 ? "s" : ""} avg growth
                </p>
                <p className="text-lg font-bold text-[#1e3a5f]">{pct(c.rate * 100, 1)} / yr</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenario(s.id)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
                  scenario === s.id
                    ? "text-white"
                    : "bg-white text-[#374151] ring-1 ring-[#e5e7eb] hover:ring-[#94a3b8]"
                }`}
                style={scenario === s.id ? { backgroundColor: accent } : undefined}
                title={s.plain}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-[#6b7280]">
            {SCENARIOS.find((s) => s.id === scenario)?.plain} Using{" "}
            <strong>{pct(annualRate * 100, 1)}</strong> growth per year.
          </p>

          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3 text-[13px]">
              <label htmlFor="year-slider" className="font-semibold text-[#1e3a5f]">
                How many years do you keep it?
              </label>
              <span className="tabular-nums text-[#374151]">
                <strong>
                  {horizon} year{horizon === 1 ? "" : "s"}
                </strong>
              </span>
            </div>
            <input
              id="year-slider"
              type="range"
              min={1}
              max={15}
              step={1}
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e5e7eb]"
              style={{ accentColor: accent }}
            />
            <div className="mt-1 flex justify-between text-[11px] text-[#6b7280]">
              <span>1 yr</span>
              <span>8 yr</span>
              <span>15 yr</span>
            </div>
          </div>

          {selected ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Estimated value then" value={usd(selected.propertyValue)} />
              <Metric
                label="Your equity"
                value={usd(selected.equity)}
                hint={`Still owe bank ${usd(selected.loanBalance)}`}
              />
              <Metric
                label="Profit vs cash you put in"
                value={usd(selected.totalProfit)}
                hint="Includes rent leftover + price growth"
                tone={selected.totalProfit >= 0 ? "good" : "bad"}
              />
              <Metric
                label="Avg return per year"
                value={pct(selected.annualizedReturn * 100, 1)}
                hint={`${selected.equityMultiple.toFixed(2)}× your cash back`}
              />
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-[11px] font-semibold tracking-wide text-[#6b7280] uppercase">
              Recent yearly price changes · {profile.label}
            </p>
            <div className="flex h-24 items-end gap-1">
              {profile.historicalYoY.slice(-10).map((y) => {
                const maxAbs = 0.25;
                const h = Math.min(100, (Math.abs(y.rate) / maxAbs) * 100);
                const up = y.rate >= 0;
                return (
                  <div key={y.year} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t ${up ? "bg-[#16a34a]" : "bg-[#dc2626]"}`}
                      style={{ height: `${Math.max(4, h)}%` }}
                      title={`${y.year}: ${pct(y.rate * 100, 1)}`}
                    />
                    <span className="text-[9px] text-[#6b7280]">{String(y.year).slice(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* —— Blended total return —— */}
      <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="px-4 py-3 text-white sm:px-5" style={{ backgroundColor: accent }}>
          <p className="text-[11px] font-semibold tracking-wide uppercase opacity-90">Model 3</p>
          <h3 className="text-lg font-bold">Total return (rent + price growth together)</h3>
        </div>
        <div className="space-y-5 bg-[#f8fafc] px-4 py-5 sm:px-5">
          <PlainBox title="What is this in plain English?">
            <p>
              Real estate can pay you in <strong>two</strong> ways at the same time:
            </p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                <strong>Rent leftovers (like a dividend)</strong> — cash you collect each year after
                bills and the mortgage.
              </li>
              <li>
                <strong>Price growth</strong> — the property becoming worth more than what you still
                owe, so your equity grows.
              </li>
            </ol>
            <p>
              This model <strong>adds both</strong> over the years you chose above. That combined
              number is your estimated <strong>total return</strong>. Uses the same down payment and
              growth scenario from Models 1 and 2.
            </p>
          </PlainBox>

          {selected && blend ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric
                  label="From rent (dividends)"
                  value={usd(blend.rentIncome)}
                  hint={`${horizon} years of leftover cash stacked up`}
                  tone={blend.rentIncome >= 0 ? "good" : "bad"}
                />
                <Metric
                  label="From price growth"
                  value={usd(blend.appreciationGain)}
                  hint="Equity today minus the cash you put in"
                  tone={blend.appreciationGain >= 0 ? "good" : "bad"}
                />
                <Metric
                  label="Total return"
                  value={usd(blend.total)}
                  hint={`On ${usd(coc.downPayment)} cash in · ${pct(selected.annualizedReturn * 100, 1)}/yr avg`}
                  tone={blend.total >= 0 ? "good" : "bad"}
                />
              </div>

              <div>
                <p className="mb-2 text-[12px] font-semibold text-[#1e3a5f]">
                  Where the money comes from (year {horizon})
                </p>
                <div className="flex h-4 overflow-hidden rounded-full bg-[#e5e7eb]">
                  {blend.rentIncome >= 0 && blend.total > 0 ? (
                    <div
                      className="bg-[#1d4ed8]"
                      style={{
                        width: `${Math.max(0, Math.min(100, (blend.rentIncome / blend.total) * 100))}%`,
                      }}
                      title="Rent"
                    />
                  ) : null}
                  {blend.appreciationGain >= 0 && blend.total > 0 ? (
                    <div
                      className="bg-[#16a34a]"
                      style={{
                        width: `${Math.max(0, Math.min(100, (blend.appreciationGain / blend.total) * 100))}%`,
                      }}
                      title="Appreciation"
                    />
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-[#374151]">
                  <span>
                    <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#1d4ed8]" />
                    Rent leftovers
                  </span>
                  <span>
                    <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#16a34a]" />
                    Price growth
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-[12px] text-[#374151]">
                  <thead>
                    <tr className="border-b border-[#e5e7eb] text-[10px] tracking-wide text-[#6b7280] uppercase">
                      <th className="py-2 pr-3 font-semibold">Year</th>
                      <th className="py-2 pr-3 font-semibold">Rent stacked</th>
                      <th className="py-2 pr-3 font-semibold">Equity gain</th>
                      <th className="py-2 pr-3 font-semibold">Total return</th>
                      <th className="py-2 font-semibold">Avg / yr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => {
                      const rent = row.cumulativeCashFlow;
                      const equityGain = row.equity - coc.downPayment;
                      const total = rent + equityGain;
                      return (
                        <tr
                          key={row.year}
                          className={`border-b border-[#f1f5f9] ${
                            row.year === horizon ? "bg-white font-semibold" : ""
                          }`}
                        >
                          <td className="py-1.5 pr-3">{row.year}</td>
                          <td className="py-1.5 pr-3 tabular-nums">{usd(rent)}</td>
                          <td className="py-1.5 pr-3 tabular-nums">{usd(equityGain)}</td>
                          <td
                            className={`py-1.5 pr-3 tabular-nums ${
                              total >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"
                            }`}
                          >
                            {usd(total)}
                          </td>
                          <td className="py-1.5 tabular-nums">
                            {pct(row.annualizedReturn * 100, 1)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          <p className="text-[11px] text-[#6b7280]">
            Tip: change the down-payment slider in Model 1 and the years / growth buttons in Model 2
            — this total-return table updates automatically.
          </p>
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "good" | "bad";
}) {
  return (
    <div className="rounded-md bg-white px-3 py-3 ring-1 ring-[#e5e7eb]">
      <p className="text-[10px] font-semibold tracking-wide text-[#6b7280] uppercase">{label}</p>
      <p
        className={`mt-1 text-xl font-bold tabular-nums ${
          tone === "good" ? "text-[#16a34a]" : tone === "bad" ? "text-[#dc2626]" : "text-[#1e3a5f]"
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-[#6b7280]">{hint}</p> : null}
    </div>
  );
}
