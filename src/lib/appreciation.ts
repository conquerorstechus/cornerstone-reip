/**
 * Greater Tampa appreciation assumptions by asset class.
 *
 * SFH long-run rates anchored to FHFA Tampa–St. Petersburg HPI
 * (≈9.6% 10-yr CAGR through 2015–2025; recent years cooler).
 * Condo / townhome / land differentials are model overlays on that
 * metro series — not a claim of official FHFA condo/land indexes.
 */

export type AssetClass = "sfh" | "condo" | "townhouse" | "land";

export type AppreciationScenario = "historical" | "base" | "optimistic" | "conservative";

export type AppreciationProfile = {
  class: AssetClass;
  label: string;
  sourceNote: string;
  /** Calendar-year YoY % for the last ~10 observed years (most recent last). */
  historicalYoY: { year: number; rate: number }[];
  /** Trailing compound annual growth rates derived / assumed. */
  trailingCagr: { years: 1 | 5 | 10; rate: number }[];
  /** Forward annual rates used in 1–15 year projections. */
  forward: Record<Exclude<AppreciationScenario, "historical">, number>;
};

/** FHFA all-transactions Tampa MSA YoY (Housing Almanac / FHFA), SFH. */
const TAMPA_SFH_YOY: { year: number; rate: number }[] = [
  { year: 2015, rate: 0.0859 },
  { year: 2016, rate: 0.1028 },
  { year: 2017, rate: 0.0987 },
  { year: 2018, rate: 0.0942 },
  { year: 2019, rate: 0.069 },
  { year: 2020, rate: 0.062 },
  { year: 2021, rate: 0.1764 },
  { year: 2022, rate: 0.2496 },
  { year: 2023, rate: 0.0895 },
  { year: 2024, rate: 0.0298 },
  { year: 2025, rate: -0.008 },
];

function cagrFromYoY(series: { rate: number }[], n: number): number {
  const slice = series.slice(-n);
  if (!slice.length) return 0;
  const growth = slice.reduce((acc, y) => acc * (1 + y.rate), 1);
  return Math.pow(growth, 1 / slice.length) - 1;
}

function scaleSeries(
  series: { year: number; rate: number }[],
  factor: number,
  floor = -0.2,
  ceil = 0.35,
): { year: number; rate: number }[] {
  return series.map((y) => ({
    year: y.year,
    rate: Math.max(floor, Math.min(ceil, y.rate * factor)),
  }));
}

const SFH_CAGR_10 = cagrFromYoY(TAMPA_SFH_YOY, 10);
const SFH_CAGR_5 = cagrFromYoY(TAMPA_SFH_YOY, 5);
const SFH_CAGR_1 = TAMPA_SFH_YOY[TAMPA_SFH_YOY.length - 1]?.rate ?? 0;

const CONDO_YOY = scaleSeries(TAMPA_SFH_YOY, 0.72);
const TOWNHOME_YOY = scaleSeries(TAMPA_SFH_YOY, 0.88);
/** Land: quieter pre-boom, stronger boom, softer lately (Florida lot / acre overlays). */
const LAND_YOY = TAMPA_SFH_YOY.map((y) => {
  let factor = 0.85;
  if (y.year >= 2021 && y.year <= 2022) factor = 1.15;
  if (y.year >= 2024) factor = 0.55;
  return { year: y.year, rate: Math.max(-0.18, Math.min(0.4, y.rate * factor)) };
});

export const APPRECIATION_PROFILES: Record<AssetClass, AppreciationProfile> = {
  sfh: {
    class: "sfh",
    label: "Single-family (SFH)",
    sourceNote:
      "Tampa–St. Petersburg FHFA HPI (all-transactions). Forward base ≈ long-run metro mean; conservative/optimistic band ±2.5 pts.",
    historicalYoY: TAMPA_SFH_YOY,
    trailingCagr: [
      { years: 1, rate: SFH_CAGR_1 },
      { years: 5, rate: SFH_CAGR_5 },
      { years: 10, rate: SFH_CAGR_10 },
    ],
    forward: {
      conservative: 0.025,
      base: 0.045,
      optimistic: 0.07,
    },
  },
  condo: {
    class: "condo",
    label: "Condo",
    sourceNote:
      "Modeled at ~72% of Tampa SFH HPI YoY (condos typically lag detached in this cycle). Forward rates discounted vs SFH.",
    historicalYoY: CONDO_YOY,
    trailingCagr: [
      { years: 1, rate: cagrFromYoY(CONDO_YOY, 1) },
      { years: 5, rate: cagrFromYoY(CONDO_YOY, 5) },
      { years: 10, rate: cagrFromYoY(CONDO_YOY, 10) },
    ],
    forward: {
      conservative: 0.01,
      base: 0.03,
      optimistic: 0.055,
    },
  },
  townhouse: {
    class: "townhouse",
    label: "Townhome",
    sourceNote:
      "Modeled at ~88% of Tampa SFH HPI YoY (attached product between condo and detached). Forward rates between SFH and condo.",
    historicalYoY: TOWNHOME_YOY,
    trailingCagr: [
      { years: 1, rate: cagrFromYoY(TOWNHOME_YOY, 1) },
      { years: 5, rate: cagrFromYoY(TOWNHOME_YOY, 5) },
      { years: 10, rate: cagrFromYoY(TOWNHOME_YOY, 10) },
    ],
    forward: {
      conservative: 0.02,
      base: 0.04,
      optimistic: 0.065,
    },
  },
  land: {
    class: "land",
    label: "Land / lots",
    sourceNote:
      "Residential land overlay on Tampa HPI (stronger 2021–22 lot demand, softer 2024–25). Illiquid — treat forward rates as scenario planning, not a forecast.",
    historicalYoY: LAND_YOY,
    trailingCagr: [
      { years: 1, rate: cagrFromYoY(LAND_YOY, 1) },
      { years: 5, rate: cagrFromYoY(LAND_YOY, 5) },
      { years: 10, rate: cagrFromYoY(LAND_YOY, 10) },
    ],
    forward: {
      conservative: 0.015,
      base: 0.04,
      optimistic: 0.08,
    },
  },
};

export function assetClassFromHomeKind(kind?: "sfh" | "condo" | "townhouse"): AssetClass {
  if (kind === "condo") return "condo";
  if (kind === "townhouse") return "townhouse";
  return "sfh";
}

export function getAppreciationProfile(assetClass: AssetClass): AppreciationProfile {
  return APPRECIATION_PROFILES[assetClass];
}

/** Resolve annual rate for a scenario. "historical" uses trailing 10-yr CAGR. */
export function annualRateForScenario(
  profile: AppreciationProfile,
  scenario: AppreciationScenario,
): number {
  if (scenario === "historical") {
    return profile.trailingCagr.find((c) => c.years === 10)?.rate ?? profile.forward.base;
  }
  return profile.forward[scenario];
}

export function projectValue(purchasePrice: number, annualRate: number, years: number): number {
  return purchasePrice * Math.pow(1 + annualRate, years);
}

export function remainingLoanBalance(
  principal: number,
  annualRate: number,
  termYears: number,
  yearsElapsed: number,
): number {
  if (principal <= 0) return 0;
  const r = annualRate / 12;
  const n = termYears * 12;
  const paid = Math.min(Math.max(0, yearsElapsed) * 12, n);
  if (r === 0) return Math.max(0, principal * (1 - paid / n));
  const payment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const balance =
    principal * Math.pow(1 + r, paid) - payment * ((Math.pow(1 + r, paid) - 1) / r);
  return Math.max(0, balance);
}
