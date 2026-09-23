import type { HomeKind } from "./types";

export type PicksKind = "sfh" | "condos" | "townhomes";

export const PICKS_META: Record<
  PicksKind,
  {
    homeKind: HomeKind;
    title: string;
    kicker: string;
    accent: string;
    soft: string;
    blurb: string;
  }
> = {
  sfh: {
    homeKind: "sfh",
    title: "Single Family Homes for Sale",
    kicker: "SINGLE FAMILY",
    accent: "#1e40af",
    soft: "bg-[#eff6ff]",
    blurb: "Detached houses ranked by cash flow. Request the address and we send it to you right away.",
  },
  condos: {
    homeKind: "condo",
    title: "Condos for Sale",
    kicker: "CONDOS",
    accent: "#7c3aed",
    soft: "bg-[#f5f3ff]",
    blurb: "Condo picks ranked by cash flow. Leave your email and phone — we send the address immediately.",
  },
  townhomes: {
    homeKind: "townhouse",
    title: "Townhomes for Sale",
    kicker: "TOWNHOMES",
    accent: "#6d28d9",
    soft: "bg-[#f5f3ff]",
    blurb: "Townhome picks ranked by cash flow. Get the street address sent to your inbox and phone.",
  },
};

export function isPicksKind(v: string): v is PicksKind {
  return v === "sfh" || v === "condos" || v === "townhomes";
}

export function picksPathForHomeKind(kind?: HomeKind): string {
  if (kind === "condo") return "/picks/condos";
  if (kind === "townhouse") return "/picks/townhomes";
  return "/picks/sfh";
}
