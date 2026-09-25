import { readFile } from "fs/promises";
import path from "path";
import { cache } from "react";
import { hashId, sanitizeDescription, titleCaseAddress } from "./format";
import type { DealThesis, DigestReport, LandParcel, Property } from "./types";

/** Approx coords for known area slugs (avoids importing data.ts). */
const AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  "wesley-chapel": { lat: 28.2397, lng: -82.3279 },
  zephyrhills: { lat: 28.2336, lng: -82.1812 },
  lutz: { lat: 28.1511, lng: -82.4615 },
  "east-tampa": { lat: 27.995, lng: -82.379 },
  seffner: { lat: 27.998, lng: -82.276 },
  "land-o-lakes": { lat: 28.219, lng: -82.457 },
  odessa: { lat: 28.187, lng: -82.591 },
};

/** Raw row from Sam's High ROI export (sams-list-*.json). */
export type SamListItem = {
  fullAddress: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  price: number;
  url?: string;
  homeType?: string;
  yearBuilt?: string | number;
  lotSqft?: string | number;
  descRaw?: string;
  desc?: string;
  description?: string;
  monthlyTax?: number;
  monthlyHoa?: number;
  monthlyRent?: number;
  monthlyInsurance?: number;
  offerPrice?: number;
  monthlyMortgage?: number;
  mortgageUrl?: string;
  cashFlow?: number;
  flags?: string[];
  category?: string;
  rank?: string | number;
  scrape_date?: string;
};

const CITY_TO_AREA: Record<string, string> = {
  "wesley chapel": "wesley-chapel",
  zephyrhills: "zephyrhills",
  lutz: "lutz",
  tampa: "east-tampa",
  seffner: "seffner",
  "land o lakes": "land-o-lakes",
  "land o' lakes": "land-o-lakes",
  odessa: "odessa",
  hudson: "wesley-chapel",
  "spring hill": "wesley-chapel",
  "new port richey": "wesley-chapel",
  "new pt richey": "wesley-chapel",
  riverview: "east-tampa",
  ruskin: "east-tampa",
  "apollo beach": "east-tampa",
  "plant city": "seffner",
  lakeland: "zephyrhills",
  "polk city": "zephyrhills",
  parrish: "east-tampa",
  "lakewood ranch": "east-tampa",
  sarasota: "east-tampa",
  "bradenton beach": "east-tampa",
};

const DEFAULT_COORDS = { lat: 27.9506, lng: -82.4572 };

function normCity(city: string) {
  return city.trim().toLowerCase().replace(/\s+/g, " ");
}

export function areaSlugForCity(city: string): string {
  return CITY_TO_AREA[normCity(city)] ?? normCity(city).replace(/\s+/g, "-");
}

function coordsForArea(slug: string) {
  return AREA_COORDS[slug] ?? DEFAULT_COORDS;
}

function streetAddress(full: string, city: string): string {
  const cut = full.split(",")[0]?.trim() ?? full;
  const cleaned = cut.replace(new RegExp(`\\s*${city}\\s*$`, "i"), "").trim();
  return titleCaseAddress(cleaned || cut);
}

function thesisFor(item: SamListItem): DealThesis {
  const cat = item.category ?? "";
  if (cat === "land") return "land-bank";
  if (cat === "townhouse_condo") return "turnkey";
  const flags = (item.flags ?? []).join(" ").toLowerCase();
  const desc = (item.descRaw ?? item.desc ?? "").toLowerCase();
  if (desc.includes("rehab") || desc.includes("fix") || flags.includes("vacant")) return "full-rehab";
  if (desc.includes("move-in") || desc.includes("turnkey")) return "turnkey";
  return "cashflow";
}

function tagsFor(item: SamListItem): string[] {
  const tags: string[] = [];
  if (item.homeType === "TOWNHOUSE") tags.push("Townhome");
  if (item.homeType === "CONDO") tags.push("Condo");
  if (item.homeType === "SINGLE_FAMILY") tags.push("SFR");
  if (item.homeType === "LOT") tags.push("Land");
  for (const f of item.flags ?? []) {
    if (f && !tags.includes(f)) tags.push(f);
  }
  tags.push(item.city);
  return tags;
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

export function isHomeItem(item: SamListItem) {
  return item.category !== "land" && item.homeType !== "LOT";
}

export function isLandItem(item: SamListItem) {
  return item.category === "land" || item.homeType === "LOT";
}

function homeKindFor(item: SamListItem): "sfh" | "condo" | "townhouse" {
  if (item.homeType === "CONDO") return "condo";
  if (item.homeType === "TOWNHOUSE" || item.category === "townhouse_condo") return "townhouse";
  return "sfh";
}

export function mapSamItemToProperty(item: SamListItem): Property {
  const areaSlug = areaSlugForCity(item.city);
  const { lat, lng } = coordsForArea(areaSlug);
  const seed = item.url || item.fullAddress;
  const rank = num(item.rank, 0) || undefined;
  const address = streetAddress(item.fullAddress, item.city);
  const rawDesc = (item.descRaw || item.description || item.desc || "").trim();
  const description = sanitizeDescription(rawDesc, {
    address,
    city: item.city,
    state: item.state || "FL",
    zip: String(item.zip),
  });

  return {
    id: hashId("p", seed),
    rank,
    address,
    city: item.city,
    state: item.state || "FL",
    zip: String(item.zip),
    lat,
    lng,
    zillowUrl: item.url,
    mortgageUrl: item.mortgageUrl,
    thesis: thesisFor(item),
    homeKind: homeKindFor(item),
    description,
    beds: num(item.beds),
    baths: num(item.baths),
    sqft: num(item.sqft),
    lotSqft: num(item.lotSqft) || undefined,
    yearBuilt: num(item.yearBuilt) || new Date().getFullYear(),
    ask: num(item.price),
    offer: num(item.offerPrice, num(item.price)),
    rent: num(item.monthlyRent),
    taxMonthly: num(item.monthlyTax),
    hoaMonthly: num(item.monthlyHoa),
    insuranceMonthly: num(item.monthlyInsurance),
    mortgageMonthly: num(item.monthlyMortgage),
    cashFlow: num(item.cashFlow),
    flags: item.flags?.filter(Boolean),
    tags: tagsFor(item),
    areaSlug,
  };
}

export function mapSamItemToLand(item: SamListItem): LandParcel {
  const areaSlug = areaSlugForCity(item.city);
  const { lat, lng } = coordsForArea(areaSlug);
  const lot = num(item.lotSqft);
  const acres = lot > 0 ? lot / 43560 : 0.25;
  const asking = num(item.price);
  const pricePerAcre = acres > 0 ? Math.round(asking / acres) : asking;
  const seed = item.url || item.fullAddress;
  const address = streetAddress(item.fullAddress, item.city);
  const raw =
    (item.descRaw || item.description || item.desc || "").trim() ||
    "Lot from Sam's High ROI land screen. Underwrite zoning, utilities, and flood before LOI.";
  const thesis = sanitizeDescription(raw, {
    address,
    city: item.city,
    state: item.state || "FL",
    zip: String(item.zip),
  });

  return {
    id: hashId("l", seed),
    rank: num(item.rank, 0) || undefined,
    address,
    city: item.city,
    zip: String(item.zip),
    lat,
    lng,
    acres: Math.round(acres * 100) / 100,
    lotSqft: lot || undefined,
    zoning: "Verify with county",
    floodZone: "Check FEMA",
    utilities: ["Verify at site"],
    asking,
    offer: num(item.offerPrice, asking),
    pricePerAcre,
    buildableSf: Math.round(acres * 43560 * 0.35),
    maxUnits: Math.max(1, Math.floor(acres * 8)),
    investorScore: Math.min(90, Math.max(40, 55 + Math.round(num(item.cashFlow) / 50))),
    thesis,
    zillowUrl: item.url,
    mortgageUrl: item.mortgageUrl,
    taxMonthly: num(item.monthlyTax),
    hoaMonthly: num(item.monthlyHoa),
    insuranceMonthly: num(item.monthlyInsurance),
    mortgageMonthly: num(item.monthlyMortgage),
    cashFlow: num(item.cashFlow),
    flags: item.flags?.filter(Boolean),
    comps: [],
    scenarios: [
      {
        name: "Hold / bank",
        units: 0,
        cost: asking,
        exitValue: Math.round(asking * 1.15),
        profit: Math.round(asking * 0.15),
        roi: 15,
      },
    ],
    areaSlug,
  };
}

async function readLocalSamList(): Promise<SamListItem[] | null> {
  try {
    const file = path.join(process.cwd(), "sams-list-20260922.json");
    const text = await readFile(file, "utf8");
    const data = JSON.parse(text) as unknown;
    return Array.isArray(data) ? (data as SamListItem[]) : null;
  } catch {
    return null;
  }
}

/** Slow listings webhook. Cached in the Next.js data cache, not in function memory. */
export const LISTINGS_URL =
  process.env.SAM_LIST_URL?.trim() ||
  "https://n8n.srv1393511.hstgr.cloud/webhook/latest-listings";

export const LISTINGS_CACHE_TAG = "latest-listings";

/** One day. Refreshed only when a request arrives and the cache is stale, or on manual refresh. */
export const LISTINGS_REVALIDATE_SECONDS = 60 * 60 * 24;

/** Fetch Sam's list from the listings webhook (or SAM_LIST_URL). Falls back to the local file if that request fails. */
export const fetchSamList = cache(async (): Promise<SamListItem[]> => {
  try {
    const res = await fetch(LISTINGS_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: LISTINGS_REVALIDATE_SECONDS, tags: [LISTINGS_CACHE_TAG] },
    });
    if (!res.ok) {
      throw new Error(`Listings fetch failed: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) {
      throw new Error("Listings URL must return a JSON array");
    }
    return data as SamListItem[];
  } catch (err) {
    const local = await readLocalSamList();
    if (local) return local;
    throw err;
  }
});

export function propertiesFromSamList(items: SamListItem[]): Property[] {
  const homes = items.filter(isHomeItem).map(mapSamItemToProperty);
  const rankKind = (kind: "sfh" | "condo" | "townhouse") =>
    homes
      .filter((p) => (p.homeKind ?? "sfh") === kind)
      .sort((a, b) => b.cashFlow - a.cashFlow)
      .map((p, i) => ({ ...p, rank: i + 1 }));

  return [...rankKind("sfh"), ...rankKind("condo"), ...rankKind("townhouse")];
}

export function landFromSamList(items: SamListItem[]): LandParcel[] {
  return items
    .filter(isLandItem)
    .map(mapSamItemToLand)
    .sort((a, b) => (b.cashFlow ?? 0) - (a.cashFlow ?? 0) || a.asking - b.asking)
    .map((l, i) => ({ ...l, rank: i + 1 }));
}

export function digestFromProperties(deals: Property[], scrapeDate?: string): DigestReport {
  const dateLabel = scrapeDate
    ? new Date(`${scrapeDate}T12:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  return {
    id: `digest-${scrapeDate ?? "live"}`,
    title: "Sam's High ROI Picks",
    date: dateLabel,
    source: "REIP · High ROI digest",
    intro:
      "Greater Tampa deals ranked by cash flow within each product type. Mortgage estimated at 7% fixed, 30-year, 50% down. All figures are estimates.",
    deals,
  };
}
