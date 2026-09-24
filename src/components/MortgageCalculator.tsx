"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  amortizationByYear,
  buildClosingCosts,
  categoryLabel,
  fullAmortizationSchedule,
  type ClosingCostLine,
} from "../lib/closing-costs";
import { LOAN_OFFICER } from "../lib/loan-officer";
import { monthly, pct, usd } from "../lib/format";
import { MortgageQuoteButton } from "./MortgageQuoteButton";

type LoanProgram = "30-fixed" | "15-fixed" | "5-arm";
type MainTab = "payment" | "closing" | "schedule" | "lifetime";

const DEFAULTS = {
  price: 350_000,
  downPct: 20,
  rate: 7,
  zip: "33602",
  program: "30-fixed" as LoanProgram,
  taxAnnual: 0,
  insuranceAnnual: 0,
  hoaMonthly: 0,
};

function programYears(program: LoanProgram): number {
  if (program === "15-fixed") return 15;
  return 30;
}

function pmiMonthly(loan: number, price: number): number {
  if (price <= 0 || loan / price <= 0.8) return 0;
  return (loan * 0.007) / 12;
}

function parseNum(v: string | null, fallback: number): number {
  if (v == null || v.trim() === "") return fallback;
  const n = Number(String(v).replace(/[,$%]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

export function MortgageCalculator({
  initial,
}: {
  initial?: Partial<{
    price: number;
    down: number;
    downPct: number;
    rate: number;
    zip: string;
    taxes: number;
    insurance: number;
    hoa: number;
    program: LoanProgram;
  }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const boot = useMemo(() => {
    const price = parseNum(
      searchParams.get("price") ?? searchParams.get("homePrice"),
      initial?.price ?? DEFAULTS.price,
    );
    const downDollar = searchParams.get("down") ?? searchParams.get("downPayment");
    const downPctParam = searchParams.get("downPct") ?? searchParams.get("downpercent");
    let downPct = initial?.downPct ?? DEFAULTS.downPct;
    if (downDollar != null) {
      const d = parseNum(downDollar, price * (downPct / 100));
      downPct = price > 0 ? (d / price) * 100 : downPct;
    } else if (downPctParam != null) {
      downPct = parseNum(downPctParam, downPct);
    } else if (initial?.down != null && price > 0) {
      downPct = (initial.down / price) * 100;
    }

    const rate = parseNum(
      searchParams.get("rate") ?? searchParams.get("interestRate"),
      initial?.rate ?? DEFAULTS.rate,
    );
    const zip = searchParams.get("zip") ?? initial?.zip ?? DEFAULTS.zip;
    const programRaw = searchParams.get("program") ?? initial?.program ?? DEFAULTS.program;
    const program: LoanProgram =
      programRaw === "15-fixed" || programRaw === "15" || programRaw === "15yr"
        ? "15-fixed"
        : programRaw === "5-arm" || programRaw === "arm"
          ? "5-arm"
          : "30-fixed";

    return {
      price,
      downPct: Math.min(100, Math.max(0, downPct)),
      rate,
      zip,
      program,
      taxAnnual: parseNum(searchParams.get("taxes") ?? searchParams.get("tax"), initial?.taxes ?? 0),
      insuranceAnnual: parseNum(searchParams.get("insurance"), initial?.insurance ?? 0),
      hoaMonthly: parseNum(searchParams.get("hoa"), initial?.hoa ?? 0),
    };
  }, [searchParams, initial]);

  const [price, setPrice] = useState(boot.price);
  const [downPct, setDownPct] = useState(boot.downPct);
  const [rate, setRate] = useState(boot.rate);
  const [zip, setZip] = useState(boot.zip);
  const [program, setProgram] = useState<LoanProgram>(boot.program);
  const [taxAnnual, setTaxAnnual] = useState(boot.taxAnnual);
  const [insuranceAnnual, setInsuranceAnnual] = useState(boot.insuranceAnnual);
  const [hoaMonthly, setHoaMonthly] = useState(boot.hoaMonthly);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [tab, setTab] = useState<MainTab>("payment");
  const [scheduleYear, setScheduleYear] = useState(1);
  const [showAllMonths, setShowAllMonths] = useState(false);

  useEffect(() => {
    setPrice(boot.price);
    setDownPct(boot.downPct);
    setRate(boot.rate);
    setZip(boot.zip);
    setProgram(boot.program);
    setTaxAnnual(boot.taxAnnual);
    setInsuranceAnnual(boot.insuranceAnnual);
    setHoaMonthly(boot.hoaMonthly);
  }, [boot]);

  const downPayment = (price * downPct) / 100;
  const loanAmount = Math.max(0, price - downPayment);
  const years = programYears(program);
  const effectiveTaxAnnual = taxAnnual > 0 ? taxAnnual : price * 0.012;
  const effectiveInsAnnual = insuranceAnnual > 0 ? insuranceAnnual : price * 0.0046;

  const amort = useMemo(
    () => fullAmortizationSchedule(loanAmount, rate, years),
    [loanAmount, rate, years],
  );
  const yearly = useMemo(() => amortizationByYear(amort.rows), [amort.rows]);

  const taxMo = effectiveTaxAnnual / 12;
  const insMo = effectiveInsAnnual / 12;
  const pmi = pmiMonthly(loanAmount, price);
  const pi = amort.payment;
  const totalPayment = pi + taxMo + insMo + pmi + hoaMonthly;

  const closing = useMemo(
    () =>
      buildClosingCosts({
        price,
        loanAmount,
        annualRatePct: rate,
        taxAnnual: effectiveTaxAnnual,
        insuranceAnnual: effectiveInsAnnual,
        hoaMonthly,
      }),
    [price, loanAmount, rate, effectiveTaxAnnual, effectiveInsAnnual, hoaMonthly],
  );

  const cashToClose = downPayment + closing.cashToCloseExDown;
  const firstYearTaxes = effectiveTaxAnnual;
  const firstYearInsurance = effectiveInsAnnual;
  const firstYearHoa = hoaMonthly * 12;
  const firstYearPmi = pmi * 12;
  const firstYearHousing =
    pi * 12 + firstYearTaxes + firstYearInsurance + firstYearHoa + firstYearPmi;

  const monthsInYear = amort.rows.filter((r) => r.year === scheduleYear);
  const scheduleRows = showAllMonths ? amort.rows : monthsInYear;

  const pushUrl = useCallback(
    (next: {
      price: number;
      downPct: number;
      rate: number;
      zip: string;
      program: LoanProgram;
      taxAnnual: number;
      insuranceAnnual: number;
      hoaMonthly: number;
    }) => {
      const q = new URLSearchParams();
      q.set("price", String(Math.round(next.price)));
      q.set("down", String(Math.round((next.price * next.downPct) / 100)));
      q.set("rate", String(Number(next.rate.toFixed(3))));
      if (next.zip) q.set("zip", next.zip);
      if (next.program !== "30-fixed") q.set("program", next.program);
      if (next.taxAnnual > 0) q.set("taxes", String(Math.round(next.taxAnnual)));
      if (next.insuranceAnnual > 0) q.set("insurance", String(Math.round(next.insuranceAnnual)));
      if (next.hoaMonthly > 0) q.set("hoa", String(Math.round(next.hoaMonthly)));
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    },
    [pathname, router],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      pushUrl({ price, downPct, rate, zip, program, taxAnnual, insuranceAnnual, hoaMonthly });
    }, 250);
    return () => clearTimeout(t);
  }, [price, downPct, rate, zip, program, taxAnnual, insuranceAnnual, hoaMonthly, pushUrl]);

  const piShare = totalPayment > 0 ? (pi / totalPayment) * 100 : 0;
  const taxShare = totalPayment > 0 ? (taxMo / totalPayment) * 100 : 0;
  const insShare = totalPayment > 0 ? (insMo / totalPayment) * 100 : 0;
  const pmiShare = totalPayment > 0 ? (pmi / totalPayment) * 100 : 0;
  const hoaShare = totalPayment > 0 ? (hoaMonthly / totalPayment) * 100 : 0;

  const linesByCat = useMemo(() => {
    const m = new Map<ClosingCostLine["category"], ClosingCostLine[]>();
    for (const l of closing.lines) {
      const arr = m.get(l.category) ?? [];
      arr.push(l);
      m.set(l.category, arr);
    }
    return m;
  }, [closing.lines]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-[#2563eb] uppercase">
          Mortgage
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#1e3a5f] sm:text-3xl">
          Mortgage &amp; closing-cost calculator
        </h1>
        <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-[#6b7280]">
          Monthly payment, full amortization, Florida-typical closing costs (title, deed stamps,
          survey, escrow, and more). URL params{" "}
          <code className="text-[12px]">price</code>, <code className="text-[12px]">down</code>,{" "}
          <code className="text-[12px]">rate</code> update live.
        </p>
      </div>

      <LoanOfficerCard />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Inputs */}
        <div className="space-y-4 rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
          <Field label="Home price">
            <MoneyInput value={price} onChange={setPrice} />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Down payment ($)">
              <MoneyInput
                value={downPayment}
                onChange={(v) => setDownPct(price > 0 ? (v / price) * 100 : 0)}
              />
            </Field>
            <Field label="Down payment (%)">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={Number(downPct.toFixed(2))}
                  onChange={(e) => setDownPct(Number(e.target.value) || 0)}
                  className="w-full rounded-md border border-[#e5e7eb] px-3 py-2.5 text-[15px] outline-none focus:border-[#2563eb]"
                />
                <span className="text-[#6b7280]">%</span>
              </div>
            </Field>
          </div>

          <Field label="ZIP code">
            <input
              type="text"
              inputMode="numeric"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/[^\d]/g, "").slice(0, 5))}
              className="w-full rounded-md border border-[#e5e7eb] px-3 py-2.5 text-[15px] outline-none focus:border-[#2563eb]"
            />
          </Field>

          <Field label="Loan program">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["30-fixed", "30-year fixed"],
                  ["15-fixed", "15-year fixed"],
                  ["5-arm", "5-year ARM"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setProgram(id)}
                  className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${
                    program === id
                      ? "bg-[#2563eb] text-white"
                      : "bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Interest rate">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={20}
                step={0.001}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value) || 0)}
                className="w-full rounded-md border border-[#e5e7eb] px-3 py-2.5 text-[15px] outline-none focus:border-[#2563eb]"
              />
              <span className="text-[#6b7280]">%</span>
            </div>
          </Field>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-[13px] font-semibold text-[#2563eb] hover:underline"
          >
            {showAdvanced ? "Hide" : "Show"} taxes, insurance, HOA
          </button>

          {showAdvanced ? (
            <div className="grid gap-3 border-t border-[#e5e7eb] pt-4 sm:grid-cols-3">
              <Field label="Property tax ($/yr)">
                <MoneyInput
                  value={Math.round(effectiveTaxAnnual)}
                  onChange={setTaxAnnual}
                />
              </Field>
              <Field label="Home insurance ($/yr)">
                <MoneyInput
                  value={Math.round(effectiveInsAnnual)}
                  onChange={setInsuranceAnnual}
                />
              </Field>
              <Field label="HOA ($/mo)">
                <MoneyInput value={hoaMonthly} onChange={setHoaMonthly} />
              </Field>
            </div>
          ) : null}

          <dl className="grid grid-cols-2 gap-2 rounded-lg bg-[#f8fafc] p-3 text-[12px] text-[#374151] sm:grid-cols-4">
            <Stat label="Loan amount" value={usd(loanAmount)} />
            <Stat label="LTV" value={pct(price > 0 ? (loanAmount / price) * 100 : 0, 1)} />
            <Stat label="Cash to close (est.)" value={usd(cashToClose)} />
            <Stat label="Lifetime interest" value={usd(amort.totalInterest)} />
          </dl>
        </div>

        {/* Results panel */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
            <div className="flex flex-wrap gap-3 border-b border-[#e5e7eb] text-[12px] font-semibold sm:text-[13px]">
              {(
                [
                  ["payment", "Monthly"],
                  ["closing", "Cash to close"],
                  ["schedule", "Full schedule"],
                  ["lifetime", "Lifetime"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`pb-2 ${
                    tab === id
                      ? "border-b-2 border-[#2563eb] text-[#2563eb]"
                      : "text-[#6b7280] hover:text-[#374151]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "payment" ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-[12px] font-semibold tracking-wide text-[#6b7280] uppercase">
                    Total monthly housing payment
                  </p>
                  <p className="text-3xl font-bold text-[#1e3a5f]">{monthly(totalPayment)}</p>
                  <p className="text-[12px] text-[#6b7280]">
                    P&amp;I {monthly(pi)} + taxes + insurance
                    {pmi > 0 ? " + PMI" : ""}
                    {hoaMonthly > 0 ? " + HOA" : ""}
                  </p>
                </div>

                <div className="flex h-3 overflow-hidden rounded-full bg-[#e5e7eb]">
                  <Seg w={piShare} className="bg-[#2563eb]" />
                  <Seg w={taxShare} className="bg-[#f97316]" />
                  <Seg w={insShare} className="bg-[#22c55e]" />
                  <Seg w={pmiShare} className="bg-[#a855f7]" />
                  <Seg w={hoaShare} className="bg-[#64748b]" />
                </div>

                <ul className="space-y-2 text-[13px] text-[#374151]">
                  <Row color="bg-[#2563eb]" label="Principal & interest" value={monthly(pi)} />
                  <Row color="bg-[#f97316]" label="Property taxes" value={monthly(taxMo)} />
                  <Row color="bg-[#22c55e]" label="Homeowners insurance" value={monthly(insMo)} />
                  {pmi > 0 ? (
                    <Row color="bg-[#a855f7]" label="PMI (est. until ~20% equity)" value={monthly(pmi)} />
                  ) : (
                    <li className="text-[12px] text-[#6b7280]">PMI: none (down payment ≥ 20%)</li>
                  )}
                  {hoaMonthly > 0 ? (
                    <Row color="bg-[#64748b]" label="HOA dues" value={monthly(hoaMonthly)} />
                  ) : null}
                </ul>

                <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-3 text-[12px] leading-relaxed text-[#4b5563]">
                  <p className="font-semibold text-[#1e3a5f]">First-year housing cost (est.)</p>
                  <p className="mt-1">
                    {usd(firstYearHousing)} / year — includes 12× P&amp;I, annual taxes (
                    {usd(firstYearTaxes)}), insurance ({usd(firstYearInsurance)})
                    {firstYearHoa > 0 ? `, HOA (${usd(firstYearHoa)})` : ""}
                    {firstYearPmi > 0 ? `, PMI (${usd(firstYearPmi)})` : ""}.
                  </p>
                </div>
              </div>
            ) : null}

            {tab === "closing" ? (
              <div className="mt-4 space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <BigStat label="Down payment" value={usd(downPayment)} />
                  <BigStat label="Closing + prepaids + escrow" value={usd(closing.cashToCloseExDown)} />
                  <BigStat label="Est. cash to close" value={usd(cashToClose)} highlight />
                  <BigStat label="Purchase price" value={usd(price)} />
                </div>

                <p className="text-[12px] leading-relaxed text-[#6b7280]">
                  Typical Greater Tampa / Florida buyer costs. Deed documentary stamps are often
                  seller-paid locally but listed for a complete picture. County and contract terms
                  change who pays what — confirm on your Closing Disclosure.
                </p>

                {([...linesByCat.entries()] as [ClosingCostLine["category"], ClosingCostLine[]][]).map(
                  ([cat, lines]) => (
                    <div key={cat}>
                      <div className="mb-1.5 flex items-baseline justify-between">
                        <h3 className="text-[13px] font-bold text-[#1e3a5f]">
                          {categoryLabel(cat)}
                        </h3>
                        <span className="text-[13px] font-semibold tabular-nums text-[#374151]">
                          {usd(closing.byCategory[cat])}
                        </span>
                      </div>
                      <ul className="divide-y divide-[#f1f5f9] rounded-md border border-[#e5e7eb] bg-[#fafafa]">
                        {lines.map((l) => (
                          <li key={l.id} className="px-3 py-2 text-[12px]">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-[#374151]">{l.label}</p>
                                {l.note ? (
                                  <p className="mt-0.5 text-[11px] text-[#6b7280]">{l.note}</p>
                                ) : null}
                                {l.typicallyPaidBy ? (
                                  <p className="mt-0.5 text-[10px] tracking-wide text-[#94a3b8] uppercase">
                                    Typically: {l.typicallyPaidBy}
                                  </p>
                                ) : null}
                              </div>
                              <span className="shrink-0 tabular-nums font-semibold text-[#1e3a5f]">
                                {usd(l.amount)}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
                )}
              </div>
            ) : null}

            {tab === "schedule" ? (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-[12px] font-semibold text-[#6b7280]">
                    Year
                    <select
                      className="ml-2 rounded border border-[#e5e7eb] px-2 py-1 text-[13px] text-[#1e3a5f]"
                      value={scheduleYear}
                      onChange={(e) => setScheduleYear(Number(e.target.value))}
                      disabled={showAllMonths}
                    >
                      {yearly.map((y) => (
                        <option key={y.year} value={y.year}>
                          Year {y.year}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAllMonths((v) => !v)}
                    className="rounded-full bg-[#eff6ff] px-3 py-1 text-[12px] font-semibold text-[#2563eb]"
                  >
                    {showAllMonths ? "Show one year" : `Show all ${amort.rows.length} months`}
                  </button>
                </div>

                {!showAllMonths && yearly[scheduleYear - 1] ? (
                  <p className="text-[12px] text-[#6b7280]">
                    Year {scheduleYear}: principal {usd(yearly[scheduleYear - 1].principal)}, interest{" "}
                    {usd(yearly[scheduleYear - 1].interest)}, ending balance{" "}
                    {usd(yearly[scheduleYear - 1].endingBalance)}.
                  </p>
                ) : null}

                <div className="max-h-[28rem] overflow-auto rounded-md border border-[#e5e7eb]">
                  <table className="w-full min-w-[32rem] text-left text-[11px] text-[#374151]">
                    <thead className="sticky top-0 bg-[#f8fafc]">
                      <tr className="border-b border-[#e5e7eb] text-[10px] tracking-wide text-[#6b7280] uppercase">
                        <th className="px-2 py-2">#</th>
                        <th className="px-2 py-2">Payment</th>
                        <th className="px-2 py-2">Principal</th>
                        <th className="px-2 py-2">Interest</th>
                        <th className="px-2 py-2">Balance</th>
                        <th className="px-2 py-2">Cum. interest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleRows.map((r) => (
                        <tr key={r.month} className="border-b border-[#f1f5f9]">
                          <td className="px-2 py-1 tabular-nums">{r.month}</td>
                          <td className="px-2 py-1 tabular-nums">{usd(r.payment)}</td>
                          <td className="px-2 py-1 tabular-nums">{usd(r.principal)}</td>
                          <td className="px-2 py-1 tabular-nums">{usd(r.interest)}</td>
                          <td className="px-2 py-1 tabular-nums">{usd(r.balance)}</td>
                          <td className="px-2 py-1 tabular-nums">{usd(r.cumulativeInterest)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {tab === "lifetime" ? (
              <div className="mt-4 space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <BigStat label="Total of all P&I payments" value={usd(amort.totalPaid)} />
                  <BigStat label="Total interest over life" value={usd(amort.totalInterest)} highlight />
                  <BigStat label="Amount borrowed" value={usd(loanAmount)} />
                  <BigStat
                    label="Interest as % of loan"
                    value={
                      loanAmount > 0 ? pct((amort.totalInterest / loanAmount) * 100, 0) : "—"
                    }
                  />
                </div>

                <div>
                  <h3 className="mb-2 text-[13px] font-bold text-[#1e3a5f]">Year-by-year summary</h3>
                  <div className="max-h-80 overflow-auto rounded-md border border-[#e5e7eb]">
                    <table className="w-full text-left text-[11px] text-[#374151]">
                      <thead className="sticky top-0 bg-[#f8fafc]">
                        <tr className="border-b border-[#e5e7eb] text-[10px] text-[#6b7280] uppercase">
                          <th className="px-2 py-2">Year</th>
                          <th className="px-2 py-2">Principal paid</th>
                          <th className="px-2 py-2">Interest paid</th>
                          <th className="px-2 py-2">Ending balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearly.map((y) => (
                          <tr key={y.year} className="border-b border-[#f1f5f9]">
                            <td className="px-2 py-1">{y.year}</td>
                            <td className="px-2 py-1 tabular-nums">{usd(y.principal)}</td>
                            <td className="px-2 py-1 tabular-nums">{usd(y.interest)}</td>
                            <td className="px-2 py-1 tabular-nums">{usd(y.endingBalance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-3 text-[12px] leading-relaxed text-[#4b5563]">
                  <p className="font-semibold text-[#1e3a5f]">All-in first-check estimate</p>
                  <p className="mt-1">
                    Down payment {usd(downPayment)} + closing/prepaids/escrow{" "}
                    {usd(closing.cashToCloseExDown)} = <strong>{usd(cashToClose)}</strong> due around
                    closing (before any seller credits or lender credits).
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <a
            href={LOAN_OFFICER.phoneHref}
            className="flex min-h-12 items-center justify-center rounded-lg bg-[#f97316] px-4 text-[15px] font-bold text-white hover:bg-[#ea580c]"
          >
            Call {LOAN_OFFICER.name} · {LOAN_OFFICER.phone}
          </a>
          <MortgageQuoteButton
            scenario={{
              price,
              downPayment,
              downPct,
              rate,
              program,
              zip,
              loanAmount,
              taxes: effectiveTaxAnnual,
              insurance: effectiveInsAnnual,
              hoa: hoaMonthly,
            }}
          />
        </div>
      </div>

      <OwnershipCheatSheet
        taxAnnual={effectiveTaxAnnual}
        insAnnual={effectiveInsAnnual}
        hoaMonthly={hoaMonthly}
        price={price}
      />

      <p className="text-[11px] leading-relaxed text-[#6b7280]">
        Estimates only — not a Loan Estimate or Closing Disclosure. Florida documentary stamps,
        intangible tax, title premiums, and escrow cushions vary by county, lender, and title
        company. NMLS #{LOAN_OFFICER.nmls} · Company NMLS #{LOAN_OFFICER.companyNmls}.{" "}
        <Link href="/disclaimers" className="font-semibold text-[#2563eb] hover:underline">
          Disclaimers
        </Link>
      </p>
    </div>
  );
}

function OwnershipCheatSheet({
  taxAnnual,
  insAnnual,
  hoaMonthly,
  price,
}: {
  taxAnnual: number;
  insAnnual: number;
  hoaMonthly: number;
  price: number;
}) {
  const rows = [
    {
      title: "Property taxes",
      body: `Est. ${usd(taxAnnual)}/yr (${pct(price > 0 ? (taxAnnual / price) * 100 : 0, 2)} of price). FL millage varies by county; homestead exemption can lower this after you occupy.`,
    },
    {
      title: "Homeowners insurance",
      body: `Est. ${usd(insAnnual)}/yr. Coastal / older roofs / claims history can push this much higher in Florida.`,
    },
    {
      title: "Flood insurance",
      body: "Not in the base payment. Required in Special Flood Hazard Areas; often $400–$2,000+/yr. Get an elevation certificate quote early.",
    },
    {
      title: "HOA / condo / CDD",
      body: hoaMonthly > 0
        ? `${monthly(hoaMonthly)} entered. Also budget special assessments and condo master insurance deductible risk.`
        : "None entered. Gated / townhome / condo deals often add $50–$500+/mo plus estoppel fees at closing.",
    },
    {
      title: "Maintenance reserve",
      body: `Rule of thumb 1–2% of price / year (${usd(price * 0.01)}–${usd(price * 0.02)}) for repairs, appliances, HVAC.`,
    },
    {
      title: "Utilities (owner-occupied est.)",
      body: "Electric, water, trash, internet — often $250–$450/mo for a typical Tampa-area SFR (highly variable).",
    },
    {
      title: "Vacancy / capex (if investing)",
      body: "Underwrite 5% vacancy and separate capital reserves; cash-flow screens on REIP are before these buffers.",
    },
  ];

  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="text-lg font-bold text-[#1e3a5f]">Ongoing ownership — don’t forget these</h2>
      <p className="mt-1 text-[13px] text-[#6b7280]">
        Beyond the mortgage payment, real ownership includes the line items below.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.title} className="rounded-lg bg-[#f8fafc] px-3 py-3 ring-1 ring-[#e5e7eb]">
            <p className="text-[13px] font-semibold text-[#1e3a5f]">{r.title}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#4b5563]">{r.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LoanOfficerCard() {
  const lo = LOAN_OFFICER;
  return (
    <aside className="overflow-hidden rounded-xl border border-[#dbeafe] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="border-b border-[#dbeafe] bg-[#eff6ff] px-4 py-2 text-[11px] font-semibold tracking-wide text-[#2563eb] uppercase">
        Your loan officer
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0 space-y-2">
          <div>
            <h2 className="text-xl font-bold text-[#2563eb] sm:text-2xl">{lo.name}</h2>
            <p className="text-[14px] font-semibold text-[#f97316]">{lo.title}</p>
            <p className="text-[13px] font-semibold text-[#f97316]">NMLS # {lo.nmls}</p>
          </div>
          <div className="h-px bg-[#2563eb]/30" />
          <p className="text-[13px] font-bold tracking-wide text-[#2563eb]">{lo.company}</p>
          <ul className="space-y-1.5 text-[13px] text-[#374151]">
            <li>
              <a href={lo.phoneHref} className="font-medium text-[#2563eb] hover:underline">
                {lo.phone}
              </a>
            </li>
            <li>
              <a href={lo.emailHref} className="font-medium text-[#2563eb] hover:underline">
                {lo.email}
              </a>
            </li>
            <li className="text-[#6b7280]">{lo.addressLines.join(", ")}</li>
            <li className="text-[#6b7280]">
              Company NMLS # {lo.companyNmls} · Licensed in {lo.licensedIn}
            </li>
            <li>
              <a
                href={lo.website}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#2563eb] hover:underline"
              >
                {lo.websiteLabel}
              </a>
            </li>
          </ul>
        </div>
        <div className="justify-self-center sm:justify-self-end">
          <Image
            src={lo.photoSrc}
            alt={`${lo.name} — ${lo.title}, ${lo.company}`}
            width={640}
            height={280}
            className="h-auto w-full max-w-md rounded-lg border border-[#e5e7eb] object-contain"
            priority
          />
        </div>
      </div>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold tracking-wide text-[#6b7280] uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

function MoneyInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-[#e5e7eb] px-3 focus-within:border-[#2563eb]">
      <span className="text-[#6b7280]">$</span>
      <input
        type="number"
        min={0}
        step={100}
        value={Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full border-0 bg-transparent py-2.5 text-[15px] outline-none"
      />
    </div>
  );
}

function Seg({ w, className }: { w: number; className: string }) {
  if (w <= 0) return null;
  return <div className={className} style={{ width: `${w}%` }} />;
}

function Row({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
        {label}
      </span>
      <strong className="tabular-nums">{value}</strong>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] tracking-wide text-[#6b7280] uppercase">{label}</dt>
      <dd className="font-semibold tabular-nums text-[#1e3a5f]">{value}</dd>
    </div>
  );
}

function BigStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-3 py-3 ring-1 ${
        highlight ? "bg-[#eff6ff] ring-[#bfdbfe]" : "bg-[#f8fafc] ring-[#e5e7eb]"
      }`}
    >
      <p className="text-[10px] font-semibold tracking-wide text-[#6b7280] uppercase">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-[#1e3a5f]">{value}</p>
    </div>
  );
}
