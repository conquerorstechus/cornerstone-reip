"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LOAN_OFFICER } from "../lib/loan-officer";
import { monthly, pct, usd } from "../lib/format";

type LoanProgram = "30-fixed" | "15-fixed" | "5-arm";

const DEFAULTS = {
  price: 350_000,
  downPct: 20,
  rate: 7,
  zip: "33602",
  program: "30-fixed" as LoanProgram,
  taxAnnual: 0, // 0 = auto from price
  insuranceAnnual: 0,
  hoaMonthly: 0,
};

function programYears(program: LoanProgram): number {
  if (program === "15-fixed") return 15;
  return 30;
}

function piPayment(principal: number, annualRatePct: number, years: number): number {
  if (principal <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
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
    const price = parseNum(searchParams.get("price") ?? searchParams.get("homePrice"), initial?.price ?? DEFAULTS.price);
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

    const rate = parseNum(searchParams.get("rate") ?? searchParams.get("interestRate"), initial?.rate ?? DEFAULTS.rate);
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
  const [tab, setTab] = useState<"breakdown" | "schedule">("breakdown");

  // Sync when URL changes (e.g. linked from a deal with ?price=&rate=)
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
  const pi = piPayment(loanAmount, rate, years);

  const taxMo = (taxAnnual > 0 ? taxAnnual : price * 0.012) / 12;
  const insMo = (insuranceAnnual > 0 ? insuranceAnnual : price * 0.0046) / 12;
  const pmi = pmiMonthly(loanAmount, price);
  const totalPayment = pi + taxMo + insMo + pmi + hoaMonthly;

  const schedule = useMemo(() => {
    const rows: { month: number; interest: number; principal: number; balance: number }[] = [];
    let bal = loanAmount;
    const r = rate / 100 / 12;
    const n = years * 12;
    const pay = pi;
    for (let m = 1; m <= n && bal > 0.5; m++) {
      const interest = bal * r;
      const principal = Math.min(bal, pay - interest);
      bal = Math.max(0, bal - principal);
      if (m <= 12 || m % 12 === 0 || m === n) {
        rows.push({ month: m, interest, principal, balance: bal });
      }
    }
    return rows;
  }, [loanAmount, rate, years, pi]);

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

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-[#2563eb] uppercase">Mortgage</p>
        <h1 className="mt-1 text-2xl font-bold text-[#1e3a5f] sm:text-3xl">Mortgage calculator</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#6b7280]">
          Estimate principal &amp; interest, taxes, insurance, PMI, and HOA. Shareable links update
          automatically — pass <code className="text-[12px]">?price=</code>,{" "}
          <code className="text-[12px]">down=</code>, and <code className="text-[12px]">rate=</code>{" "}
          in the URL.
        </p>
      </div>

      <LoanOfficerCard />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
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
            <p className="mt-1 text-[11px] text-[#6b7280]">
              Override via URL: <code>?rate=6.75</code>. Default for High ROI models is 7%.
            </p>
          </Field>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-[13px] font-semibold text-[#2563eb] hover:underline"
          >
            {showAdvanced ? "Hide advanced" : "Show advanced"} · taxes, insurance, HOA
          </button>

          {showAdvanced ? (
            <div className="grid gap-3 border-t border-[#e5e7eb] pt-4 sm:grid-cols-3">
              <Field label="Property tax ($/yr)">
                <MoneyInput
                  value={taxAnnual > 0 ? taxAnnual : Math.round(price * 0.012)}
                  onChange={setTaxAnnual}
                />
              </Field>
              <Field label="Home insurance ($/yr)">
                <MoneyInput
                  value={insuranceAnnual > 0 ? insuranceAnnual : Math.round(price * 0.0046)}
                  onChange={setInsuranceAnnual}
                />
              </Field>
              <Field label="HOA ($/mo)">
                <MoneyInput value={hoaMonthly} onChange={setHoaMonthly} />
              </Field>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
            <div className="flex gap-4 border-b border-[#e5e7eb] text-[13px] font-semibold">
              <button
                type="button"
                onClick={() => setTab("breakdown")}
                className={`pb-2 ${tab === "breakdown" ? "border-b-2 border-[#2563eb] text-[#2563eb]" : "text-[#6b7280]"}`}
              >
                Breakdown
              </button>
              <button
                type="button"
                onClick={() => setTab("schedule")}
                className={`pb-2 ${tab === "schedule" ? "border-b-2 border-[#2563eb] text-[#2563eb]" : "text-[#6b7280]"}`}
              >
                Schedule
              </button>
            </div>

            {tab === "breakdown" ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-[12px] font-semibold tracking-wide text-[#6b7280] uppercase">
                    Your payment
                  </p>
                  <p className="text-3xl font-bold text-[#1e3a5f]">{monthly(totalPayment)}</p>
                  <p className="text-[12px] text-[#6b7280]">
                    Loan {usd(loanAmount)} · {years}-year · {pct(rate, 3)} rate
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
                  {pmi > 0 ? <Row color="bg-[#a855f7]" label="PMI (est.)" value={monthly(pmi)} /> : null}
                  {hoaMonthly > 0 ? (
                    <Row color="bg-[#64748b]" label="HOA" value={monthly(hoaMonthly)} />
                  ) : null}
                </ul>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[20rem] text-left text-[12px] text-[#374151]">
                  <thead>
                    <tr className="border-b border-[#e5e7eb] text-[10px] tracking-wide text-[#6b7280] uppercase">
                      <th className="py-2 pr-2">Month</th>
                      <th className="py-2 pr-2">Principal</th>
                      <th className="py-2 pr-2">Interest</th>
                      <th className="py-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((r) => (
                      <tr key={r.month} className="border-b border-[#f1f5f9]">
                        <td className="py-1.5 pr-2">{r.month}</td>
                        <td className="py-1.5 pr-2 tabular-nums">{usd(r.principal)}</td>
                        <td className="py-1.5 pr-2 tabular-nums">{usd(r.interest)}</td>
                        <td className="py-1.5 tabular-nums">{usd(r.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-[11px] text-[#6b7280]">
                  Showing first year monthly, then yearly snapshots.
                </p>
              </div>
            )}
          </div>

          <a
            href={LOAN_OFFICER.phoneHref}
            className="flex min-h-12 items-center justify-center rounded-lg bg-[#f97316] px-4 text-[15px] font-bold text-white hover:bg-[#ea580c]"
          >
            Call {LOAN_OFFICER.name} · {LOAN_OFFICER.phone}
          </a>
          <a
            href={LOAN_OFFICER.emailHref}
            className="flex min-h-11 items-center justify-center rounded-lg border border-[#2563eb] px-4 text-[14px] font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
          >
            Email for a more accurate quote
          </a>
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-[#6b7280]">
        Estimates only — not a loan commitment. Rates and payments vary by credit, property, and
        underwriting. NMLS #{LOAN_OFFICER.nmls} · Company NMLS #{LOAN_OFFICER.companyNmls}.{" "}
        <Link href="/disclaimers" className="font-semibold text-[#2563eb] hover:underline">
          Disclaimers
        </Link>
      </p>
    </div>
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
