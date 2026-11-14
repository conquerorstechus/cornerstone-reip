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
    accent: "#0b6bf2",
    soft: "bg-blue/10",
    blurb: "Detached houses ranked by cash flow. Request the address and we send it to you right away.",
  },
  condos: {
    homeKind: "condo",
    title: "Condos for Sale",
    kicker: "CONDOS",
    accent: "#ee1488",
    soft: "bg-magenta/10",
    blurb: "Condo picks ranked by cash flow. Leave your email and phone — we send the address immediately.",
  },
  townhomes: {
    homeKind: "townhouse",
    title: "Townhomes for Sale",
    kicker: "TOWNHOMES",
    accent: "#8c7f70",
    soft: "bg-magenta/10",
    blurb: "Townhome picks ranked by cash flow. Get the street address sent to your inbox and phone.",
  },
};

export function isPicksKind(v: string): v is PicksKind {
  return v === "sfh" || v === "condos" || v === "townhomes";
}

export type DealView = PicksKind | "land";

export function isDealView(v: string): v is DealView {
  return v === "land" || isPicksKind(v);
}

export function picksPathForHomeKind(kind?: HomeKind): string {
  if (kind === "condo") return "/?view=condos";
  if (kind === "townhouse") return "/?view=townhomes";
  return "/?view=sfh";
}

/** Per-property-type label and logo-derived accent. */
export const KIND_STYLE: Record<HomeKind, { label: string; plural: string; accent: string }> = {
  sfh: { label: "Single family", plural: "Single family homes", accent: "#0b6bf2" },
  condo: { label: "Condo", plural: "Condos", accent: "#ee1488" },
  townhouse: { label: "Townhome", plural: "Townhomes", accent: "#8c7f70" },
};

export const LAND_ACCENT = "#0b1730";
