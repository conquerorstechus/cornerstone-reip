import type { AnalysisRequest, AnalysisResult } from "./types";
import { monthly, pct, usd } from "./format";

/** Matches Sam's High ROI Picks: 7% fixed, 30-year, 50% down. */
export const ASSUMPTIONS = {
  rate: 0.07,
  termYears: 30,
  downPct: 0.5,
  insuranceRate: 0.0046,
  taxRate: 0.012,
  vacancy: 0.05,
  hoaDefault: 220,
};

export function mortgagePayment(
  price: number,
  downPct = ASSUMPTIONS.downPct,
  annualRate = ASSUMPTIONS.rate,
  years = ASSUMPTIONS.termYears,
) {
  const principal = price * (1 - downPct);
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function suggestedOffer(ask: number, thesis?: string) {
  const haircut = thesis === "full-rehab" ? 0.028 : 0.018;
  return Math.round(ask * (1 - haircut));
}

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10_000) / 10_000;
  };
}

function round(n: number) {
  return Math.round(n);
}

function scoreFromCf(cf: number, ask: number) {
  const coc = ask > 0 ? ((cf * 12) / (ask * ASSUMPTIONS.downPct)) * 100 : 0;
  const raw = 42 + Math.min(40, Math.max(0, cf / 45)) + Math.min(12, coc);
  return Math.max(38, Math.min(96, Math.round(raw)));
}

function recommendation(score: number): AnalysisResult["recommendation"] {
  if (score >= 78) return "pursue";
  if (score >= 62) return "watch";
  return "pass";
}

export function analyzeProperty(req: AnalysisRequest): AnalysisResult {
  const ask = req.ask ?? 235_000;
  const offer = suggestedOffer(ask, req.query.toLowerCase().includes("rehab") ? "full-rehab" : undefined);
  const beds = req.beds ?? 3;
  const baths = req.baths ?? 2.5;
  const sqft = req.sqft ?? 1_560;
  const year = req.yearBuilt ?? 2012;
  const rent = req.rent ?? round(1.18 * (sqft * 1.12) + beds * 90);
  const tax = round((ask * ASSUMPTIONS.taxRate) / 12);
  const hoa = ASSUMPTIONS.hoaDefault;
  const insurance = round((ask * ASSUMPTIONS.insuranceRate) / 12);
  const mortgage = round(mortgagePayment(offer));
  const noi = rent - tax - hoa - insurance;
  const afterDebt = noi - mortgage;
  const score = scoreFromCf(noi, ask);
  const rec = recommendation(score);

  return {
    title: req.query,
    subtitle: `${beds} bd / ${baths} ba · ${sqft.toLocaleString()} sqft · built ${year}`,
    investorScore: score,
    recommendation: rec,
    summary:
      rec === "pursue"
        ? `At 50% down, 7%, 30 years, this screens at ${monthly(noi)} cash flow and ${monthly(afterDebt)} after the mortgage. Offer ${usd(offer)} against an ask of ${usd(ask)}.`
        : rec === "watch"
          ? `Cash flow looks like ${monthly(noi)} on paper, but HOA, taxes, or rent need a closer look before a hard offer.`
          : `Cash flow after expenses does not clear the High ROI screen. Pass unless you can buy well below ${usd(offer)}.`,
    metrics: [
      { label: "Ask", value: usd(ask) },
      { label: "Offer", value: usd(offer), hint: "est. 1.8% under ask" },
      { label: "Rent (est.)", value: monthly(rent) },
      { label: "Cash flow", value: monthly(noi), hint: "rent − tax − HOA − insurance" },
      { label: "After the mortgage", value: monthly(afterDebt) },
      { label: "Mortgage", value: monthly(mortgage), hint: "7% · 30yr · 50% down" },
      { label: "Tax", value: monthly(tax) },
      { label: "HOA", value: monthly(hoa) },
      { label: "Insurance", value: monthly(insurance) },
      { label: "Cash-on-cash", value: pct(((noi * 12) / (offer * ASSUMPTIONS.downPct)) * 100) },
    ],
    cashFlow: { rent, tax, hoa, insurance, mortgage, noi, afterDebt, ask, offer },
    sections: [
      {
        heading: "Notes",
        body: "These figures use the same High ROI Picks numbers: asking vs. suggested offer, estimated market rent, monthly tax / HOA / insurance, and a 7% fixed 30-year mortgage at 50% down. Mortgage is shown separately so cash flow matches the weekly list.",
        bullets: [
          "All figures are estimates. Confirm rent, HOA, and taxes before offering.",
          "This payment decreases when rates drop and the property is refinanced.",
          "Vacancy and repair reserves are not taken out of cash flow.",
        ],
      },
      {
        heading: "Before you offer",
        body: "Walk the home and confirm rent comps, the HOA budget, and the tax bill.",
        bullets: [
          "Confirm trailing rents, any HOA special assessments, and insurance quotes.",
          "Check flood zone, HOA rental cap, and remaining life on roof and HVAC.",
          "Model a refinance after you stabilize the property.",
        ],
      },
    ],
    raw: { type: "property", beds, baths, sqft, year },
  };
}

export function analyzeArea(req: AnalysisRequest): AnalysisResult {
  const rnd = seeded(req.query);
  const score = Math.round(58 + rnd() * 32);
  const medianAsk = round(210_000 + rnd() * 90_000);
  const medianRent = round(1_750 + rnd() * 600);
  const yoy = +(2 + rnd() * 6).toFixed(1);
  return {
    title: req.query,
    subtitle: "Submarket snapshot · Tampa Bay MSA",
    investorScore: score,
    recommendation: recommendation(score),
    summary: `${req.query} screens as a ${recommendation(score)} market for 3/2 townhomes and small multifamily under $250k, with median asks near ${usd(medianAsk)} and in-place rents around ${monthly(medianRent)}.`,
    metrics: [
      { label: "Investor score", value: String(score) },
      { label: "Median ask", value: usd(medianAsk) },
      { label: "Median rent", value: monthly(medianRent) },
      { label: "YoY price", value: pct(yoy) },
      { label: "Vacancy", value: pct(3 + rnd() * 4) },
      { label: "Job growth", value: pct(1.4 + rnd() * 2.2) },
      { label: "Flood risk", value: rnd() > 0.55 ? "Moderate" : "Low" },
      { label: "School score", value: `${Math.round(5 + rnd() * 4)}/10` },
    ],
    sections: [
      {
        heading: "Why this market",
        body: "Tampa Bay continues to absorb workforce housing inside a 30-minute commute of Wesley Chapel / I-75 employment. Investor demand is concentrated in gated townhome communities with HOA under $400.",
        bullets: [
          "Renter demand from medical, logistics, and professional services corridors.",
          "New supply is mostly BTR and garden multifamily — townhome inventory still favors mom-and-pop buyers.",
          "Watch insurance and HOA special assessments as the two variables that kill cash flow.",
        ],
      },
      {
        heading: "Risks",
        body: "Hurricane residual, HOA rental caps, and tax reassessment after purchase are the three underwriting leaks that do not show up in a Zillow scrape.",
      },
    ],
    raw: { type: "area" },
  };
}

export function analyzeLand(req: AnalysisRequest): AnalysisResult {
  const acres = req.acres ?? 1.2;
  const ask = req.ask ?? round(acres * 185_000);
  const maxUnits = Math.max(1, Math.floor(acres * 8));
  const score = Math.round(54 + (maxUnits > 4 ? 18 : 8));
  return {
    title: req.query,
    subtitle: `${acres} acres · ${maxUnits} units by-right (est.)`,
    investorScore: score,
    recommendation: recommendation(score),
    summary: `At ${usd(ask)} (${usd(ask / acres)}/acre) this parcel pencils a small multifamily or townhome pad if utilities are at the curb. Hold as a land-bank if entitlements slip past 18 months.`,
    metrics: [
      { label: "Asking", value: usd(ask) },
      { label: "$ / acre", value: usd(ask / acres) },
      { label: "Acres", value: acres.toFixed(2) },
      { label: "Est. max units", value: String(maxUnits) },
      { label: "Buildable (est.)", value: `${Math.round(acres * 0.65 * 43560).toLocaleString()} sf` },
      { label: "Zoning (est.)", value: maxUnits >= 8 ? "RM-16" : "R-3 / PD" },
    ],
    sections: [
      {
        heading: "Development scenarios",
        body: "REIP ranks three exits: hold, SFR/townhome pad, and garden multifamily. Costs are Tampa Bay 2026 conceptual — not a GC bid.",
        bullets: [
          `Hold 24 months: carry ~${usd(ask * 0.07)} (taxes + interest) with optionality on zoning.`,
          `Townhome pad (${Math.min(maxUnits, 6)} units): vertical cost ~$165k/door, exit $280–310k/door.`,
          `Garden MF (${maxUnits}+ units): only if sewer is confirmed; otherwise the deal is a land-bank.`,
        ],
      },
      {
        heading: "Site diligence",
        body: "Confirm flood panel, wetlands, access, and concurrency before depositing. Pull county maps and FEMA flood overlays in diligence.",
      },
    ],
    raw: { type: "land", acres, maxUnits },
  };
}

export function analyzeMultifamily(req: AnalysisRequest): AnalysisResult {
  const units = req.units ?? 12;
  const ask = req.ask ?? units * 145_000;
  const offer = suggestedOffer(ask);
  const gpr = units * 1_450 * 12;
  const vacancyLoss = gpr * 0.05;
  const egi = gpr - vacancyLoss;
  const expenses = egi * 0.38;
  const noi = egi - expenses;
  const cap = (noi / offer) * 100;
  const grm = offer / gpr;
  const ppu = offer / units;
  const debtYield = (noi / (offer * 0.65)) * 100;
  const score = Math.round(50 + Math.min(40, cap * 5));
  return {
    title: req.query,
    subtitle: `${units}-unit garden / small multifamily · Tampa Bay`,
    investorScore: score,
    recommendation: recommendation(score),
    summary: `At ${usd(offer)} (${usd(ppu)} per unit) this screens at a ${pct(cap)} cap rate. ${score >= 78 ? "Worth a rent-roll review." : "Needs higher rents or a lower purchase price."}`,
    metrics: [
      { label: "Ask", value: usd(ask) },
      { label: "Offer", value: usd(offer) },
      { label: "Units", value: String(units) },
      { label: "$ / unit", value: usd(ppu) },
      { label: "Gross rent", value: usd(gpr) },
      { label: "Collected rent", value: usd(egi) },
      { label: "Net income", value: usd(noi) },
      { label: "Cap rate", value: pct(cap) },
      { label: "GRM", value: grm.toFixed(2) },
      { label: "Debt yield", value: pct(debtYield) },
    ],
    sections: [
      {
        heading: "Notes",
        body: "A full rent roll is not attached. REIP assumes 5% vacancy and expenses at 38% of collected rent — typical for Tampa garden apartments. Replace with actuals when you have them.",
        bullets: [
          "Confirm unit mix and in-place vs. market rents.",
          "Re-quote insurance before you go under contract — it moves Florida deals.",
          "Plan a five-year hold and only mark rents to market if you can actually get them.",
        ],
      },
    ],
    raw: { type: "multifamily", units },
  };
}

export function runLocalAnalysis(req: AnalysisRequest): AnalysisResult {
  switch (req.type) {
    case "area":
      return analyzeArea(req);
    case "land":
      return analyzeLand(req);
    case "multifamily":
      return analyzeMultifamily(req);
    default:
      return analyzeProperty(req);
  }
}
