"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { AppreciationProfile, AppreciationScenario } from "../lib/appreciation";
import { annualRateForScenario } from "../lib/appreciation";
import { appreciationSchedule, cashOnCashAtDown, type DealFinancials } from "../lib/investment";
import { monthly, pct, usd } from "../lib/format";

const SCENARIOS: { id: AppreciationScenario; label: string; plain: string }[] = [
  { id: "historical", label: "Last 10 years", plain: "Repeats how this property type grew in Tampa over the past decade." },
  { id: "conservative", label: "Slow", plain: "Prices creep up. The careful guess." },
  { id: "base", label: "Normal", plain: "A middle-of-the-road guess." },
  { id: "optimistic", label: "Fast", plain: "A strong market. The good case, not a promise." },
];

const tone = (n: number) => (n >= 0 ? "text-success" : "text-danger");

export function InvestmentModels({
  financials,
  profile,
}: {
  financials: DealFinancials;
  profile: AppreciationProfile;
  /** Kept for call-site compatibility; the section now uses the shared brand palette. */
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
  const halfDown = useMemo(() => cashOnCashAtDown(financials, 50), [financials]);

  const glance = useMemo(
    () =>
      SCENARIOS.map((s) => {
        const row = appreciationSchedule(financials, profile, s.id, 50, 10).at(-1);
        return row ? { ...s, row } : null;
      }).filter((s): s is NonNullable<typeof s> => s != null),
    [financials, profile],
  );

  const rentIncome = selected?.cumulativeCashFlow ?? 0;
  const growthGain = selected ? selected.equity - coc.downPayment : 0;

  return (
    <section id="models" className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-navy">Money models</h2>
        <p className="mt-1 text-sm text-taupe">
          Half down, held 10 years. Each card assumes a different pace of price growth.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {glance.map((s) => {
          const total = s.row.cumulativeCashFlow + (s.row.equity - halfDown.downPayment);
          return (
            <div key={s.id} className="card p-4">
              <p className="eyebrow">{s.label} growth</p>
              <p className={`mt-1 font-display text-2xl font-semibold tabular-nums ${tone(total)}`}>
                {usd(total)}
              </p>
              <p className="mt-0.5 text-xs text-taupe">
                total gain · worth {usd(s.row.propertyValue)} in 10 yrs
              </p>
            </div>
          );
        })}
      </div>

      <div className="card space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold text-navy">Try your own numbers</h3>
          <a
            href={`/mortgage?price=${Math.round(financials.purchasePrice)}&down=${Math.round(coc.downPayment)}&rate=${((financials.rate ?? 0.07) * 100).toFixed(3)}`}
            className="text-sm font-semibold text-blue hover:underline"
          >
            Open mortgage calculator →
          </a>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Slider
            id="down-slider"
            label="Down payment"
            value={`${Math.round(downPct)}% · ${usd(coc.downPayment)}`}
            min={1}
            max={100}
            current={downPct}
            onChange={setDownPct}
            ends={["1%", "All cash"]}
          />
          <Slider
            id="year-slider"
            label="Years held"
            value={`${horizon} year${horizon === 1 ? "" : "s"}`}
            min={1}
            max={15}
            current={horizon}
            onChange={setHorizon}
            ends={["1", "15"]}
          />
        </div>

        <div>
          <p className="eyebrow mb-2">Price growth</p>
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenario(s.id)}
                title={s.plain}
                className={`min-h-9 rounded-full px-3.5 text-sm font-semibold transition-colors ${
                  scenario === s.id
                    ? "bg-navy text-white"
                    : "bg-white text-taupe ring-1 ring-line rounded-xl hover:text-navy"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-taupe">
            {SCENARIOS.find((s) => s.id === scenario)?.plain} {pct(annualRate * 100, 1)} per year.
          </p>
        </div>

        {selected ? (
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric
              label="Cash each month"
              value={monthly(coc.cashFlowMonthly)}
              tone={coc.cashFlowMonthly >= 0 ? "good" : "bad"}
              hint={coc.allCash ? "No mortgage" : `After ${monthly(coc.mortgageMonthly)} mortgage`}
            />
            <Metric label="Cash-on-cash" value={pct(coc.cashOnCash * 100, 1)} hint="Yearly, on cash in" />
            <Metric label={`Worth in ${horizon} yr`} value={usd(selected.propertyValue)} />
            <Metric
              label="Your equity"
              value={usd(selected.equity)}
              hint={`Owe ${usd(selected.loanBalance)}`}
            />
            <Metric
              label="From rent"
              value={usd(rentIncome)}
              tone={rentIncome >= 0 ? "good" : "bad"}
            />
            <Metric
              label="Total gain"
              value={usd(rentIncome + growthGain)}
              tone={rentIncome + growthGain >= 0 ? "good" : "bad"}
              hint={`${pct(selected.annualizedReturn * 100, 1)} / yr avg`}
              strong
            />
          </dl>
        ) : null}

        <details className="group border-t border-line pt-4">
          <summary className="cursor-pointer text-sm font-semibold text-navy marker:text-taupe">
            Year-by-year breakdown
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[30rem] text-left text-sm">
              <thead>
                <tr className="eyebrow border-b border-line">
                  <th className="py-2 pr-3">Year</th>
                  <th className="py-2 pr-3">Rent</th>
                  <th className="py-2 pr-3">Equity gain</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2">Avg / yr</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => {
                  const rent = row.cumulativeCashFlow;
                  const total = rent + (row.equity - coc.downPayment);
                  return (
                    <tr
                      key={row.year}
                      className={`border-b border-stone tabular-nums ${
                        row.year === horizon ? "bg-paper font-semibold" : ""
                      }`}
                    >
                      <td className="py-1.5 pr-3">{row.year}</td>
                      <td className="py-1.5 pr-3">{usd(rent)}</td>
                      <td className="py-1.5 pr-3">{usd(row.equity - coc.downPayment)}</td>
                      <td className={`py-1.5 pr-3 ${tone(total)}`}>{usd(total)}</td>
                      <td className="py-1.5">{pct(row.annualizedReturn * 100, 1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      <p className="text-xs text-taupe">
        Estimates only, not guarantees. {profile.sourceNote}
      </p>
    </section>
  );
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  current,
  onChange,
  ends,
}: {
  id: string;
  label: string;
  value: string;
  min: number;
  max: number;
  current: number;
  onChange: (n: number) => void;
  ends: [string, string];
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <label htmlFor={id} className="eyebrow">
          {label}
        </label>
        <span className="font-semibold tabular-nums text-navy">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone accent-magenta"
      />
      <div className="mt-1 flex justify-between text-[11px] text-taupe-2">
        <span>{ends[0]}</span>
        <span>{ends[1]}</span>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  tone: t,
  strong,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  tone?: "good" | "bad";
  strong?: boolean;
}) {
  return (
    <div className={`rounded-xl px-3 py-3 ${strong ? "bg-navy text-white" : "bg-paper"}`}>
      <dt className={`eyebrow ${strong ? "!text-white/60" : ""}`}>{label}</dt>
      <dd
        className={`mt-1 font-display text-lg font-semibold tabular-nums ${
          strong ? "text-white" : t === "good" ? "text-success" : t === "bad" ? "text-danger" : "text-navy"
        }`}
      >
        {value}
      </dd>
      {hint ? <p className={`mt-0.5 text-[11px] ${strong ? "text-white/60" : "text-taupe"}`}>{hint}</p> : null}
    </div>
  );
}
